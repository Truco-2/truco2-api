import {
    ArgumentsHost,
    Catch,
    ExceptionFilter,
    UnauthorizedException,
} from '@nestjs/common';
import { Socket } from 'socket.io';

@Catch(UnauthorizedException)
export class SocketIoExceptionFilter implements ExceptionFilter {
    catch(exception: UnauthorizedException, host: ArgumentsHost) {
        const socketClient: Socket = host.switchToWs().getClient();
        socketClient.emit('error', 'Unauthorized');
        socketClient.rooms.forEach((room) => {
            socketClient.leave(room);
        });
    }
}
