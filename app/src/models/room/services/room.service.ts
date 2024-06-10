import { Injectable } from '@nestjs/common';
import { faker } from '@faker-js/faker';
import { RoomDto } from '../dtos/room.dto';
import { PrismaService } from 'src/providers/prisma/prisma.service';
import { RoomStatus } from 'src/common/enums/room-status.enum';
import { plainToClass, plainToInstance } from 'class-transformer';

@Injectable()
export class RoomService {
    constructor(private prisma: PrismaService) {}

    async listAvailables(): Promise<RoomDto[] | null> {
        const rooms = await this.prisma.room.findMany({
            where: {
                status: RoomStatus.OPEN,
            },
            include: {
                owner: true,
                UsersRooms: {
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

    async create(ownerId: number, data: RoomDto): Promise<RoomDto | null> {
        await this.verifyUserHasRoom(ownerId);

        const room = await this.prisma.room.create({
            data: {
                code: await this.getNewCode(),
                name: data.name,
                ownerId: ownerId,
                status: RoomStatus.OPEN,
                isPrivate: data.isPrivate,
                maxPlayers: data.maxPlayers,
                password: data.password,
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
                status: RoomStatus.OPEN,
            },
            include: {
                owner: true,
                UsersRooms: {
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
            //groups: ['expose_user_groups'],
        });
    }

    async enter(userId: number, code: string): Promise<RoomDto | null> {
        const room = await this.prisma.room.findFirst({
            where: {
                code: code,
                status: RoomStatus.OPEN,
            },
            include: {
                UsersRooms: true,
            },
        });

        if (room === null) {
            throw new Error('Could not find room with code :' + code);
        }

        if (room.UsersRooms.length >= room.maxPlayers) {
            throw new Error('room is already full of players');
        }

        await this.verifyUserHasRoom(userId);

        await this.prisma.usersRooms.create({
            data: {
                userId: userId,
                roomId: room.id,
                assignedAt: new Date(),
            },
        });
        return plainToClass(RoomDto, room);
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
        const user = await this.prisma.$queryRaw`select 
        *
        from public.users u 
        join public.users_rooms ur on ur.user_id = u.id 
        join public.rooms r on r.id = ur.room_id 
        where 
        u.id = ${userId}
        and r.status = ${RoomStatus.OPEN}`;

        if ((user as any[]).length > 0) {
            throw new Error('user is already in room');
        }
    }
}
