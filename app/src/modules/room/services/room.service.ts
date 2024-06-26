import { Injectable } from '@nestjs/common';
import { faker } from '@faker-js/faker';
import { RoomDto } from '../dtos/room.dto';
import { PrismaService } from 'src/providers/prisma/prisma.service';
import { plainToInstance } from 'class-transformer';
import { RoomCodeDto } from '../dtos/room-code.dto';
import { RoomStatus } from 'src/common/enums/room-status.enum';

@Injectable()
export class RoomService {
    constructor(private prisma: PrismaService) {}

    async listAvailables(): Promise<RoomDto[] | null> {
        const rooms = await this.prisma.room.findMany({
            where: {
                status: RoomStatus.WAITING,
            },
            include: {
                usersRooms: {
                    include: {
                        user: true,
                    },
                },
            },
        });

        return plainToInstance(RoomDto, rooms, {
            excludeExtraneousValues: true,
        });
    }

    async create(userId: number, data: RoomDto): Promise<RoomDto | null> {
        await this.verifyUserHasRoom(userId);

        const room = await this.prisma.room.create({
            data: {
                code: await this.getNewCode(),
                name: data.name,
                ownerId: userId,
                status: RoomStatus.WAITING,
                isPrivate: data.isPrivate,
                maxPlayers: data.maxPlayers,
                password: data.password,
                usersRooms: {
                    create: {
                        userId: userId,
                    },
                },
            },
        });

        return plainToInstance(RoomDto, room, {
            excludeExtraneousValues: true,
        });
    }

    async find(code: string): Promise<RoomDto | null> {
        const room = await this.prisma.room.findFirst({
            where: {
                code: code,
                status: RoomStatus.WAITING,
            },
            include: {
                usersRooms: {
                    include: {
                        user: true,
                    },
                },
            },
        });

        if (room === null) {
            throw new Error('Could not find room with code :' + code);
        }

        return plainToInstance(RoomDto, room, {
            excludeExtraneousValues: true,
        });
    }

    async updateStatus(
        code: string,
        status: RoomStatus,
    ): Promise<RoomDto | null> {
        const room = await this.prisma.room.update({
            where: {
                code: code,
            },
            data: {
                status: status,
            },
            include: {
                usersRooms: {
                    include: {
                        user: true,
                    },
                },
            },
        });

        if (room === null) {
            throw new Error('Could not find room with code :' + code);
        }

        return plainToInstance(RoomDto, room, {
            excludeExtraneousValues: true,
        });
    }

    async enter(
        resource: RoomCodeDto,
        userId: number,
    ): Promise<RoomDto | null> {
        const room = await this.prisma.room.findFirst({
            where: {
                code: resource.code,
                status: RoomStatus.WAITING,
            },
            include: {
                usersRooms: true,
            },
        });

        if (room === null) {
            throw new Error('Could not find room with code :' + resource.code);
        }

        await this.verifyUserHasRoom(userId);

        if (room.usersRooms.length >= room.maxPlayers) {
            throw new Error('Room is already full of players');
        }

        if (room.isPrivate) {
            if (room.password !== resource.password) {
                throw new Error('Could not enter in room: wrong password');
            }
        }

        const updatedRoom = await this.prisma.room.update({
            where: { id: room.id },
            data: {
                usersRooms: {
                    create: {
                        userId: userId,
                    },
                },
            },
            include: {
                usersRooms: {
                    include: {
                        user: true,
                    },
                },
            },
        });

        return plainToInstance(RoomDto, updatedRoom, {
            excludeExtraneousValues: true,
        });
    }

    async getNewCode(): Promise<string> {
        let code: string = '';

        let roomWithCode = [{}];

        while (roomWithCode.length > 0) {
            code = faker.string.alphanumeric({
                casing: 'upper',
                length: 6,
                exclude: ['O', 'I'],
            });

            roomWithCode = await this.prisma.room.findMany({
                where: {
                    code: code,
                },
            });
        }

        return code;
    }

    async verifyUserHasRoom(userId: number): Promise<void> {
        const room = await this.prisma.room.findFirst({
            where: {
                AND: [
                    { NOT: { status: RoomStatus.FINISHED } },
                    { usersRooms: { some: { userId: userId } } },
                ],
            },
        });

        if (room !== null) {
            throw new Error('You are already in a room');
        }
    }

    async exit(userId: number): Promise<RoomDto> {
        const room = await this.prisma.room.findFirst({
            where: {
                AND: [
                    { NOT: { status: RoomStatus.FINISHED } },
                    { usersRooms: { some: { userId: userId } } },
                ],
            },
            include: {
                usersRooms: true,
            },
        });

        if (room === null) {
            throw new Error('You are not in a room');
        }

        const updatedRoom = await this.prisma.room.update({
            where: { id: room.id },
            data: {
                usersRooms: {
                    delete: {
                        userId_roomId: {
                            userId: userId,
                            roomId: room.id,
                        },
                    },
                },
            },
            include: {
                usersRooms: true,
            },
        });

        // If does not exist any player
        if (updatedRoom.usersRooms.length == 0) {
            await this.prisma.room.delete({
                where: { id: room.id },
            });
        }
        // If the owner exit the room
        else if (room.ownerId === userId) {
            const newOwner = updatedRoom.usersRooms[0].userId;
            await this.prisma.room.update({
                where: { id: room.id },
                data: {
                    ownerId: newOwner,
                },
            });
        }

        const finalRoom = this.prisma.room.findFirst({
            where: {
                AND: [
                    { NOT: { status: RoomStatus.FINISHED } },
                    { usersRooms: { some: { userId: userId } } },
                ],
            },
            include: {
                usersRooms: true,
            },
        });

        return plainToInstance(RoomDto, finalRoom, {
            excludeExtraneousValues: true,
        });
    }
}
