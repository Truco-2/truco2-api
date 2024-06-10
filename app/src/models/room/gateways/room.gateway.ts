import { UseFilters, UseGuards } from '@nestjs/common';
import {
    ConnectedSocket,
    MessageBody,
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer,
} from '@nestjs/websockets';
import { Room } from '@prisma/client';
import { Socket } from 'socket.io';
import { RoomService } from '../services/room.service';
import { JwtAuthGuard } from 'src/auth/jwt/jwt-auth.guard';
import { SocketIoExceptionFilter } from 'src/common/filters/socket-io-exception/socket-io-exception.filter';

@WebSocketGateway({ namespace: 'room' })
export class RoomGateway {
    availableRoomsListKey = 'available-rooms-list';
    availableRoomsListAllMsg = 'available-rooms-list-all-msg';
    availableRoomsListMsg = 'available-rooms-list-msg';

    constructor(private roomService: RoomService) {}

    @WebSocketServer() server;

    @UseFilters(SocketIoExceptionFilter)
    @UseGuards(JwtAuthGuard)
    @SubscribeMessage('enter-available-room-listing')
    async handleEnterAvailableRoomListing(
        @ConnectedSocket() client: Socket,
    ): Promise<void> {
        client.join(this.availableRoomsListKey);
    }

    @UseFilters(SocketIoExceptionFilter)
    @UseGuards(JwtAuthGuard)
    @SubscribeMessage('verify-available-room-listing')
    async handleVerifyAvailableRoomListing(
        @MessageBody() count: number,
        @ConnectedSocket() client: Socket,
    ): Promise<void> {
        const availableRooms = await this.roomService.listAvailables();

        if (availableRooms.length != count) {
            this.server
                .to(client.id)
                .emit(this.availableRoomsListAllMsg, availableRooms);
        }
    }

    updateAvailableList(room: Room): void {
        this.server
            .to(this.availableRoomsListKey)
            .emit(this.availableRoomsListMsg, room);
    }
}
