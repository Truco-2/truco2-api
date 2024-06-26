import { UseFilters, UseGuards } from '@nestjs/common';
import {
    ConnectedSocket,
    MessageBody,
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer,
} from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { RoomService } from '../services/room.service';
import { JwtAuthGuard } from 'src/auth/jwt/jwt-auth.guard';
import { SocketIoExceptionFilter } from 'src/common/filters/socket-io-exception/socket-io-exception.filter';
import { RoomDto } from '../dtos/room.dto';
import { Match } from 'src/modules/match/interfaces/match.interface';

@WebSocketGateway({ namespace: 'room', cors: true })
export class RoomGateway {
    availableRoomsListKey = 'available-rooms-list';
    availableRoomsListAllMsg = 'available-rooms-list-all-msg';
    availableRoomsListMsg = 'available-rooms-list-msg';

    roomKey = 'room-';
    roomUpdateKey = 'room-update';

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

    @UseFilters(SocketIoExceptionFilter)
    @UseGuards(JwtAuthGuard)
    @SubscribeMessage('enter-room')
    async handleEnterRoom(
        @MessageBody() code: string,
        @ConnectedSocket() client: Socket,
    ): Promise<void> {
        client.join(this.roomKey + code);

        const room = await this.roomService.find(code);

        this.server.to(this.roomKey + code).emit(this.roomUpdateKey, room);
    }

    updateAvailableList(room: RoomDto): void {
        this.server
            .to(this.availableRoomsListKey)
            .emit(this.availableRoomsListMsg, room);

        this.server.to(this.roomKey + room.code).emit(this.roomUpdateKey, room);
    }

    startMatch(room: RoomDto, match: Match): void {
        this.server
            .to(this.roomKey + room.code)
            .emit('match-start', { id: match.id });

        this.server.to(this.roomKey + room.code).emit(this.roomUpdateKey, room);
    }
}
