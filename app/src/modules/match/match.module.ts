import { Module } from '@nestjs/common';
import { MatchService } from './services/match/match.service';
import { MatchGateway } from './gateways/match/match.gateway';
import { PrismaModule } from 'src/providers/prisma/prima.module';

@Module({
    controllers: [],
    providers: [MatchService, MatchGateway],
    exports: [MatchService, MatchGateway],
    imports: [PrismaModule],
})
export class MatchModule {}
