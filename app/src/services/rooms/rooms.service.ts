import { Injectable } from '@nestjs/common';
import { Room } from '@prisma/client';
import { faker } from '@faker-js/faker';
import { PrismaService } from 'src/prisma.service';
import { IRoomResource } from 'src/types/rooms';

@Injectable()
export class RoomsService {
    constructor(private prisma: PrismaService) {}

    async listAvailables(): Promise<Room[] | null> {
        return this.prisma.room.findMany();
    }

    async create(data: IRoomResource): Promise<Room | null> {
        const room = {
            code: faker.seed().toString(),
            name: data.name,
            ownerId: 1,
            isPrivate: data.isPrivate,
            maxPlayers: data.maxPlayers,
            password: data.password,
        };

        return this.prisma.room.create({
            data: room,
        });
    }

    async enter(Code: string): Promise<Room | null> {
        const room = await this.prisma.room.findFirst({
            where: {
                code: Code,
            },
            include: {
                UsersRooms: true,
            },
        });

        room.UsersRooms.push({
            userId: 90,
            roomId: 40,
            assignedAt: new Date(),
        });

        return room;
    }
}
