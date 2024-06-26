import { Module } from '@nestjs/common';
import { MatchGateway } from './gateways/match.gateway';
import { PrismaModule } from 'src/providers/prisma/prima.module';
import { MatchService } from './services/match.service';
import { MatchController } from './controllers/match.controller';

@Module({
    controllers: [MatchController],
    providers: [MatchService, MatchGateway],
    exports: [MatchService, MatchGateway],
    imports: [PrismaModule],
})
export class MatchModule {}
