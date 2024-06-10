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
        const room = {
            code: faker.seed().toString(),
            name: data.name,
            ownerId: ownerId,
            isPrivate: data.isPrivate,
            maxPlayers: data.maxPlayers,
            password: data.password,
        };

        return await this.prisma.room.create({
            data: room,
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

        await this.prisma.usersRooms.create({
            data: {
                userId: userId,
                roomId: room.id,
                assignedAt: new Date(),
            },
        });

        return room;
    }
}
