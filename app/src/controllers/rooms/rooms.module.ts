import { Module } from '@nestjs/common';
import { RoomGateway } from 'src/gateways/room/room.gateway';
import { PrismaService } from 'src/prisma.service';
import { RoomsService } from 'src/services/rooms/rooms.service';

@Module({ providers: [RoomsService, PrismaService, RoomGateway], imports: [] })
export class RoomsModule {}
