import { UnauthorizedException } from '@nestjs/common';
import { SocketIoExceptionFilter } from './socket-io-exception.filter';

const mockEmit = jest.fn().mockImplementation((key: string, data: string) => {
    return key + data;
});

const mockLeave = jest.fn().mockImplementation((id: string) => {
    return id;
});

const mookRooms: string[] = ['id1', 'id2'];

const mockArgumentsHost = {
    switchToHttp: jest.fn(),
    getArgByIndex: jest.fn(),
    getArgs: jest.fn(),
    getType: jest.fn(),
    switchToRpc: jest.fn(),
    switchToWs: jest.fn().mockImplementation(() => ({
        getClient: jest.fn().mockImplementation(() => ({
            emit: mockEmit,
            rooms: mookRooms,
            leave: mockLeave,
        })),
        getData: jest.fn(),
        getPattern: jest.fn(),
    })),
};

describe('SocketIoExceptionFilter', () => {
    it('should be defined', () => {
        expect(new SocketIoExceptionFilter()).toBeDefined();
    });

    describe('Catch UnauthorizedException', () => {
        it('Return exception messages and status code, with success equals to false', async () => {
            new SocketIoExceptionFilter().catch(
                new UnauthorizedException(),
                mockArgumentsHost,
            );

            expect(mockEmit).toHaveBeenCalledTimes(1);
            expect(mockLeave).toHaveBeenCalledTimes(mookRooms.length);
        });
    });
});
