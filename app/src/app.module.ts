import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './models/user/user.module';
import { RoomModule } from './models/room/room.module';
import { PrismaModule } from './providers/prisma/prima.module';

@Module({
    imports: [AuthModule, UserModule, RoomModule, PrismaModule],
    controllers: [AppController],
    providers: [],
})
export class AppModule {}
