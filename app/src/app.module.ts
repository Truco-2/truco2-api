import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { PrismaService } from './prisma.service';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './models/user/user.module';
import { RoomModule } from './models/room/room.module';

@Module({
    imports: [AuthModule, UserModule, RoomModule],
    controllers: [AppController],
    providers: [PrismaService],
})
export class AppModule {}
