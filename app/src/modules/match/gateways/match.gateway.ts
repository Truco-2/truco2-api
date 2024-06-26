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
import { MatchStatus } from 'src/common/enums/match.enum';

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
            if (match.status == MatchStatus.STARTING) {
                this.server.to('match_' + match.id).emit('match-msg', {
                    code: 'START-TIMER',
                    data: {
                        counter: counter,
                    },
                });

                counter--;

                if (counter > 0) {
                    this.sendStartTimer(match, counter);
                } else {
                    this.requestBets(match, 30);
                }
            }
        }, 1000);
    }

    async requestBets(match: Match, counter): Promise<void> {
        setTimeout(() => {
            const playerId = this.matchService.verifyBetsRequest(match);

            if (match.status == MatchStatus.REQUESTING_BETS && playerId > -1) {
                this.server.to('match_' + match.id).emit('match-msg', {
                    code: 'REQUESTING-BETS',
                    data: {
                        playerId: playerId,
                        options: this.matchService.getBetOptions(
                            match,
                            playerId,
                        ),
                        counter: counter,
                    },
                });

                counter--;

                if (counter > 0) {
                    this.requestBets(match, counter);
                }
            } else {
            }
        }, 1000);
    }
}
