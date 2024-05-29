import { Module } from '@nestjs/common';
import { RoomGateway } from 'src/gateways/room/room.gateway';
import { PrismaService } from 'src/prisma.service';
import { RoomService } from 'src/services/room/room.service';

@Module({ providers: [RoomService, PrismaService, RoomGateway], imports: [] })
export class RoomsModule {}
