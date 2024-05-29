import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { Socket, io } from 'socket.io-client';
import { RoomGateway } from '../../../src/models/room/gateways/room.gateway';

describe('AppController (e2e)', () => {
    let app: INestApplication;
    let ioClient: Socket;

    beforeEach(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            providers: [RoomGateway],
        }).compile();

        app = moduleFixture.createNestApplication();

        ioClient = io('http://localhost:3000/room', {
            autoConnect: false,
            transports: ['websocket', 'polling'],
        });
        await app.listen(3000);
    });

    afterAll(async () => {
        await app.close();
    });

    it('should emit "cliet.id sends: Hello world!" on "message"', async () => {
        ioClient.connect();
        ioClient.emit('message', 'Hello world!');
        await new Promise<void>((resolve) => {
            ioClient.on('server-message', (data) => {
                expect(data).toBe(`${ioClient.id} sends: Hello world!`);
                resolve();
            });
        });
        ioClient.disconnect();
    });
});
