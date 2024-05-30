import { Injectable } from '@nestjs/common';
import { Room } from '@prisma/client';
import { faker } from '@faker-js/faker';
import { RoomResourceDto } from '../dtos/room.dto';
import { PrismaService } from 'src/providers/prisma/prisma.service';

@Injectable()
export class RoomService {
    constructor(private prisma: PrismaService) {}

    async listAvailables(): Promise<Room[] | null> {
        return this.prisma.room.findMany({
            where: {
                isPrivate: false,
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
    }

    async create(ownerId: number, data: RoomResourceDto): Promise<Room | null> {
        return await this.prisma.room.create({
            data: {
                code: await this.getNewCode(),
                name: data.name,
                ownerId: ownerId,
                isPrivate: data.isPrivate,
                maxPlayers: data.maxPlayers,
                password: data.password,
            },
        });
    }

    async enter(userId: number, code: string): Promise<Room | null> {
        const room = await this.prisma.room.findFirst({
            where: {
                code: code,
            },
            include: {
                UsersRooms: true,
            },
        });

        if (
            room.UsersRooms.findIndex((userRoom) => userRoom.userId == userId)
        ) {
            throw new Error('player is already in room');
        }

        if (room.UsersRooms.length >= room.maxPlayers) {
            throw new Error('room is already full of players');
        }

        await this.prisma.usersRooms.create({
            data: {
                userId: userId,
                roomId: room.id,
                assignedAt: new Date(),
            },
        });

        return room;
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
}
