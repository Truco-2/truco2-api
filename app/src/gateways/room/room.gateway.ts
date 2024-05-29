import { UseGuards } from '@nestjs/common';
import {
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer,
} from '@nestjs/websockets';
import { Room } from '@prisma/client';
import { Socket } from 'socket.io';
import { LocalAuthGuard } from 'src/auth/local/local-auth.guard';
import { RoomsService } from 'src/services/rooms/rooms.service';

@WebSocketGateway({ namespace: 'room' })
export class RoomGateway {
    availableRoomsListKey = 'available-rooms-list';
    availableRoomsListMsg = 'available-rooms-list-msg';

    constructor(private roomsService: RoomsService) {}

    @WebSocketServer() server;

    @UseGuards(LocalAuthGuard)
    handleConnection(client: Socket): void {
        console.log(client.id);
    }

    // @UseGuards(LocalAuthGuard)
    @SubscribeMessage('message')
    handleMessage(client: Socket, message: string): void {
        const msg = `${client.id} sends: ${message}`;

        this.server.emit('server-message', msg);
    }

    @SubscribeMessage('enter-available-room-listing')
    async handleEnterAvailableRoomListing(client: Socket): Promise<void> {
        client.join(this.availableRoomsListKey);

        const availableRooms = await this.roomsService.listAvailables();

        this.server
            .to(client.id)
            .emit(this.availableRoomsListMsg, availableRooms);
    }

    updateAvailableList(room: Room): void {
        this.server
            .to(this.availableRoomsListKey)
            .emit(this.availableRoomsListMsg, room);
    }
}
