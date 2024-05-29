import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { PrismaService } from './prisma.service';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './services/user/user.module';
import { UserService } from './services/user/user.service';
import { RoomGateway } from './gateways/room/room.gateway';
import { RoomService } from './services/room/room.service';
import { RoomsController } from './controllers/rooms/rooms.controller';
import { RoomsModule } from './controllers/rooms/rooms.module';

@Module({
    imports: [AuthModule, UserModule, RoomsModule],
    controllers: [AppController, RoomsController],
    providers: [PrismaService, UserService, RoomGateway, RoomService],
})
export class AppModule {}
