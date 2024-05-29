import { UseGuards } from '@nestjs/common';
import {
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer,
} from '@nestjs/websockets';
import { Room } from '@prisma/client';
import { Socket } from 'socket.io';
import { RoomService } from '../services/room.service';
import { JwtAuthGuard } from 'src/auth/jwt/jwt-auth.guard';

@WebSocketGateway({ namespace: 'room' })
export class RoomGateway {
    availableRoomsListKey = 'available-rooms-list';
    availableRoomsListMsg = 'available-rooms-list-msg';

    constructor(private roomService: RoomService) {}

    @WebSocketServer() server;

    handleConnection(client: Socket): void {
        console.log(client.id);
    }

    @UseGuards(JwtAuthGuard)
    @SubscribeMessage('message')
    handleMessage(client: Socket, message: string): void {
        const msg = `${client.id} sends: ${message}`;

        this.server.emit('server-message', msg);
    }

    @SubscribeMessage('enter-available-room-listing')
    async handleEnterAvailableRoomListing(client: Socket): Promise<void> {
        client.join(this.availableRoomsListKey);

        const availableRooms = await this.roomService.listAvailables();

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
