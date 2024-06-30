import {
    ArgumentsHost,
    BadRequestException,
    Catch,
    ExceptionFilter,
    HttpException,
    UnauthorizedException,
} from '@nestjs/common';
import { Socket } from 'socket.io';

@Catch(BadRequestException, HttpException, Error, UnauthorizedException)
export class SocketIoExceptionFilter<T> implements ExceptionFilter {
    catch(exception: T, host: ArgumentsHost) {
        const socketClient: Socket = host.switchToWs().getClient();
        socketClient.emit('error', exception['message']);

        if (exception['message'] == 'Unauthorized') {
            socketClient.rooms.forEach((room) => {
                socketClient.leave(room);
            });
        }
    }
}
