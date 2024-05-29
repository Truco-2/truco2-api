import { Module } from '@nestjs/common';
import { RoomController } from './controllers/room.controller';
import { RoomService } from './services/room.service';
import { PrismaService } from 'src/prisma.service';
import { RoomGateway } from './gateways/room.gateway';

@Module({
    controllers: [RoomController],
    providers: [RoomService, PrismaService, RoomGateway],
    exports: [RoomService, RoomGateway],
})
export class RoomModule {}
