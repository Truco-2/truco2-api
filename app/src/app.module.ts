import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { RoomModule } from './modules/room/room.module';
import { PrismaModule } from './providers/prisma/prima.module';
import { MatchModule } from './modules/match/match.module';

@Module({
    imports: [AuthModule, UserModule, RoomModule, PrismaModule, MatchModule],
    controllers: [AppController],
    providers: [],
})
export class AppModule {}
