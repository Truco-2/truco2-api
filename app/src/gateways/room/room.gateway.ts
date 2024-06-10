import { UseGuards } from '@nestjs/common';
import {
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer,
} from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { LocalAuthGuard } from 'src/auth/local/local-auth.guard';

@WebSocketGateway({ namespace: 'room' })
export class RoomGateway {
    constructor() {}

    @WebSocketServer() server;

    @UseGuards(LocalAuthGuard)
    handleConnection(client: Socket): void {
        console.log(client.id);
    }

    @UseGuards(LocalAuthGuard)
    @SubscribeMessage('message')
    handleMessage(client: Socket, message: string): void {
        const msg = `${client.id} sends: ${message}`;

        this.server.emit('server-message', msg);
    }

    @SubscribeMessage('enter-available-room-listing')
    handleEnterAvailableRoomListing(
        client: Socket,
        body: { gameRoomId: number },
    ): void {
        client.join(body.gameRoomId.toString());
        this.server
            .to(body.gameRoomId)
            .emit(
                'server-message',
                `${client.id} has entered the room ${body.gameRoomId}`,
            );
    }
}
