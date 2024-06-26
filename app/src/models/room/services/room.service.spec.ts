import { Test, TestingModule } from '@nestjs/testing';
import { RoomService } from './room.service';
import { RoomModule } from '../room.module';

describe('RoomService', () => {
    let service: RoomService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            imports: [RoomModule],
        }).compile();

        service = module.get<RoomService>(RoomService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});
