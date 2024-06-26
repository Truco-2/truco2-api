import { Test, TestingModule } from '@nestjs/testing';
import { MatchService } from './match.service';
import { MatchModule } from '../match.module';

describe('MatchService', () => {
    let service: MatchService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            imports: [MatchModule],
        }).compile();

        service = module.get<MatchService>(MatchService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});
