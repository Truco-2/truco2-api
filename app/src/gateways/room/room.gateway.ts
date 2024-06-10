import {
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer,
} from '@nestjs/websockets';

@WebSocketGateway({ namespace: 'room' })
export class RoomGateway {
    @WebSocketServer() server;

    @SubscribeMessage('message')
    handleMessage(client: any, message: string): void {
        const msg = `${client.id} sends: ${message}`;

        this.server.emit('server-message', msg);
    }

    @SubscribeMessage('enter-available-room-listing')
    handleEnterAvailableRoomListing(
        client: any,
        body: { gameRoomId: number },
    ): void {
        client.join(body.gameRoomId);
        this.server
            .to(body.gameRoomId)
            .emit(
                'server-message',
                `${client.id} has entered the room ${body.gameRoomId}`,
            );
    }
}
