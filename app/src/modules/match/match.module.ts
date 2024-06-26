import { Module } from '@nestjs/common';
import { MatchGateway } from './gateways/match.gateway';
import { PrismaModule } from 'src/providers/prisma/prima.module';
import { MatchService } from './services/match.service';
import { MatchController } from './controllers/match.controller';
import { RoomModule } from '../room/room.module';

@Module({
    controllers: [MatchController],
    providers: [MatchService, MatchGateway],
    exports: [MatchService, MatchGateway],
    imports: [PrismaModule, RoomModule],
})
export class MatchModule {}
