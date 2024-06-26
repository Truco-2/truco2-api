import {
    ConnectedSocket,
    MessageBody,
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer,
} from '@nestjs/websockets';
import { MatchService } from '../services/match.service';
import { Socket } from 'socket.io';
import { Match } from '../interfaces/match.interface';

@WebSocketGateway({ namespace: 'match', cors: true })
export class MatchGateway {
    @WebSocketServer() server;

    constructor(private matchService: MatchService) {}

    @SubscribeMessage('list')
    async handleList(): Promise<void> {
        this.server.emit('match-msg', await this.matchService.list());
    }

    @SubscribeMessage('enter')
    async handleEnter(
        @MessageBody() body: { matchId: number; userId: number },
        @ConnectedSocket() client: Socket,
    ): Promise<void> {
        const match = await this.matchService.enter(
            body.matchId,
            body.userId,
            client.id,
        );

        client.join('match_' + match.id);

        this.server.to('match_' + match.id).emit('match-msg', {
            code: 'PLAYER-STATUS',
            data: match,
        });
    }

    async sendStartTimer(match: Match, counter: number): Promise<void> {
        setTimeout(() => {
            this.server.to('match_' + match.id).emit('match-msg', {
                code: 'START-TIMER',
                data: {
                    counter: counter,
                },
            });

            counter--;

            if (counter > 0) {
                this.sendStartTimer(match, counter);
            }
        }, 1000);
    }
}
