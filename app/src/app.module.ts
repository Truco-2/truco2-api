import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { PrismaService } from './prisma.service';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './services/user/user.module';
import { UserService } from './services/user/user.service';
import { RoomGateway } from './gateways/room/room.gateway';
import { RoomService } from './services/room/room.service';
import { RoomsModule } from './controllers/room/room.module';
import { RoomController } from './controllers/room/room.controller';

@Module({
    imports: [AuthModule, UserModule, RoomsModule],
    controllers: [AppController, RoomController],
    providers: [PrismaService, UserService, RoomGateway, RoomService],
})
export class AppModule {}
