import { Test, TestingModule } from '@nestjs/testing';
import { MatchGateway } from './match.gateway';
import { MatchModule } from '../match.module';

describe('MatchGateway', () => {
    let gateway: MatchGateway;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            imports: [MatchModule],
        }).compile();

        gateway = module.get<MatchGateway>(MatchGateway);
    });

    it('should be defined', () => {
        expect(gateway).toBeDefined();
    });
});
