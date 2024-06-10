import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { PrismaService } from './prisma.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './services/users/users.module';
import { UsersService } from './services/users/users.service';
import { RoomGateway } from './gateways/room/room.gateway';
import { RoomsService } from './services/rooms/rooms.service';
import { RoomsController } from './controllers/rooms/rooms.controller';
import { RoomsModule } from './controllers/rooms/rooms.module';

@Module({
    imports: [AuthModule, UsersModule, RoomsModule],
    controllers: [AppController, RoomsController],
    providers: [PrismaService, UsersService, RoomGateway, RoomsService],
})
export class AppModule {}
