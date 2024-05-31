import { Test, TestingModule } from '@nestjs/testing';
import { RoomGateway } from './room.gateway';
import { RoomModule } from '../room.module';

describe('RoomGateway', () => {
    let gateway: RoomGateway;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            imports: [RoomModule],
        }).compile();

        gateway = module.get<RoomGateway>(RoomGateway);
    });

    it('should be defined', () => {
        expect(gateway).toBeDefined();
    });
});
