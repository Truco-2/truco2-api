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

    @SubscribeMessage('bet')
    async handleBet(
        @MessageBody() body: { matchId: number; bet: number },
        @ConnectedSocket() client: Socket,
    ): Promise<void> {
        const match = await this.matchService.makeBet(
            body.matchId,
            body.bet,
            client.id,
        );

        client.join('match_' + match.id);

        this.server.to('match_' + match.id).emit('match-msg', {
            code: 'BET',
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

    async requestBets(
        match: Match,
        counter: number,
        latsId: number = -10,
    ): Promise<void> {
        setTimeout(() => {
            const playerId = this.matchService.verifyBetsRequest(match);

            if (playerId != latsId) {
                counter = 30;
            }

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
                    this.requestBets(match, counter, playerId);
                } else {
                    this.matchService.makeBetBot(match.id, playerId);

                    this.server.to('match_' + match.id).emit('match-msg', {
                        code: 'BET',
                        data: match,
                    });

                    this.requestBets(match, 30);
                }
            } else {
                this.requestPlays(match, 30);
            }
        }, 1000);
    }

    async requestPlays(
        match: Match,
        counter: number,
        latsId: number = -10,
    ): Promise<void> {
        setTimeout(() => {
            const playerId = this.matchService.verifyPlaysRequest(match);

            if (playerId != latsId) {
                counter = 30;
            }

            if (match.status == MatchStatus.REQUESTING_PLAYS && playerId > -1) {
                this.server.to('match_' + match.id).emit('match-msg', {
                    code: 'REQUESTING-PLAYS',
                    data: {
                        playerId: playerId,
                        counter: counter,
                    },
                });

                counter--;

                if (counter > 0) {
                    this.requestPlays(match, counter, playerId);
                } else {
                    // this.matchService.makeBetBot(match.id, playerId);
                    // this.server.to('match_' + match.id).emit('match-msg', {
                    //     code: 'BET',
                    //     data: match,
                    // });
                    // this.requestBets(match, 30);
                }
            } else {
            }
        }, 1000);
    }
}
