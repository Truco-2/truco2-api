import { Module } from '@nestjs/common';
import { RoomController } from './controllers/room.controller';
import { RoomService } from './services/room.service';
import { RoomGateway } from './gateways/room.gateway';
import { PrismaModule } from 'src/providers/prisma/prima.module';

@Module({
    controllers: [RoomController],
    providers: [RoomService, RoomGateway],
    exports: [RoomService, RoomGateway],
    imports: [PrismaModule],
})
export class RoomModule {}
