import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { RoomModule } from './modules/room/room.module';
import { PrismaModule } from './providers/prisma/prima.module';
import { MatchService } from './modules/match/services/match/match.service';
import { MatchGateway } from './modules/match/gateways/match/match.gateway';

@Module({
    imports: [AuthModule, UserModule, RoomModule, PrismaModule],
    controllers: [AppController],
    providers: [MatchService, MatchGateway],
})
export class AppModule {}
