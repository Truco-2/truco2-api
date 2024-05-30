import { Injectable } from '@nestjs/common';
import { Room } from '@prisma/client';
import { faker } from '@faker-js/faker';
import { RoomResourceDto } from '../dtos/room.dto';
import { PrismaService } from 'src/providers/prisma/prisma.service';
import { RoomStatus } from 'src/common/enums/room-status.enum';

@Injectable()
export class RoomService {
    constructor(private prisma: PrismaService) {}

    async listAvailables(): Promise<Room[] | null> {
        return this.prisma.room.findMany({
            where: {
                isPrivate: false,
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
    }

    async create(ownerId: number, data: RoomResourceDto): Promise<Room | null> {
        await this.verifyUserHasRoom(ownerId);

        return await this.prisma.room.create({
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
    }

    async enter(userId: number, code: string): Promise<Room | null> {
        const room = await this.prisma.room.findFirst({
            where: {
                code: code,
                status: RoomStatus.OPEN,
            },
            include: {
                UsersRooms: true,
            },
        });

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
