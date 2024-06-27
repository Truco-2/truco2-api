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
import { MatchServerMessage, MatchStatus } from 'src/common/enums/match.enum';

@WebSocketGateway({ namespace: 'match', cors: true })
export class MatchGateway {
    @WebSocketServer() server;
    msgKey = 'match-msg';
    defaultCounter = 3;

    constructor(private matchService: MatchService) {}

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

        this.sendPlayerStatus(match);
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

        this.sendBet(
            match,
            this.matchService.getPlayerIdByClientId(client.id),
            body.bet,
        );
    }

    @SubscribeMessage('play')
    async handlePlay(
        @MessageBody() body: { matchId: number; card: number },
        @ConnectedSocket() client: Socket,
    ): Promise<void> {
        const match = await this.matchService.makePlay(
            body.matchId,
            body.card,
            client.id,
        );

        client.join('match_' + match.id);

        this.sendPlay(
            match,
            this.matchService.getPlayerIdByClientId(client.id),
            body.card,
        );
    }

    async sendStartTimer(
        match: Match,
        counter: number = this.defaultCounter,
    ): Promise<void> {
        setTimeout(() => {
            if (match.status == MatchStatus.STARTING) {
                this.sendStartCounter(match, counter);

                counter--;

                if (counter > 0) {
                    this.sendStartTimer(match, counter);
                } else {
                    this.matchService.updateStatus(
                        match,
                        MatchStatus.REQUESTING_BETS,
                    );
                    this.requestBets(match, this.defaultCounter);
                }
            }
        }, 1000);
    }

    async requestBets(
        match: Match,
        counter: number,
        latsId: number = -10,
    ): Promise<void> {
        setTimeout(async () => {
            const playerId = this.matchService.verifyBetsRequest(match);

            if (playerId != latsId) {
                counter = this.defaultCounter;
            }

            if (match.status == MatchStatus.REQUESTING_BETS && playerId > -1) {
                this.sendRequestBet(match, playerId, counter);

                counter--;

                if (counter > 0) {
                    this.requestBets(match, counter, playerId);
                } else {
                    const bet = await this.matchService.makeBetBot(
                        match.id,
                        playerId,
                    );

                    this.sendBet(match, playerId, bet);

                    this.requestBets(match, this.defaultCounter);
                }
            } else {
                this.matchService.updateStatus(
                    match,
                    MatchStatus.REQUESTING_PLAYS,
                );
                this.requestPlays(match, this.defaultCounter);
            }
        }, 1000);
    }

    async requestPlays(
        match: Match,
        counter: number,
        latsId: number = -10,
    ): Promise<void> {
        setTimeout(async () => {
            const playerId = this.matchService.verifyPlaysRequest(match);

            if (playerId != latsId) {
                counter = this.defaultCounter;
            }

            if (match.status == MatchStatus.REQUESTING_PLAYS && playerId > -1) {
                this.sendRequestPlay(match, playerId, counter);

                counter--;

                if (counter > 0) {
                    this.requestPlays(match, counter, playerId);
                } else {
                    const card = await this.matchService.makePlayBot(
                        match.id,
                        playerId,
                    );

                    this.sendPlay(match, playerId, card);

                    this.requestPlays(match, this.defaultCounter);
                }
            } else {
                this.matchService.updateStatus(
                    match,
                    MatchStatus.TURN_FINISHED,
                );

                const winner = this.matchService.calculateTurnWinner(match);

                const status = this.matchService.startNextTurn(match, winner);

                if (status == MatchStatus.REQUESTING_PLAYS) {
                    this.requestPlays(match, this.defaultCounter);
                } else if (status == MatchStatus.REQUESTING_BETS) {
                    this.requestBets(match, this.defaultCounter);
                }
            }
        }, 1000);
    }

    async sendStartCounter(match: Match, counter: number) {
        this.server.to('match_' + match.id).emit(this.msgKey, {
            code: MatchServerMessage.MATCH_START_TIMER,
            data: {
                counter: counter,
            },
        });
    }

    async sendRoundStart(match: Match) {
        const resources = this.matchService.getMatchResources(match);

        resources.forEach((r) => {
            this.server.to(r.clientId).emit(this.msgKey, {
                code: MatchServerMessage.ROUND_START,
                data: {
                    cards: r.cards,
                    match: r.match,
                },
            });
        });
    }

    async sendRequestBet(match: Match, playerId: number, counter: number) {
        this.server.to('match_' + match.id).emit(this.msgKey, {
            code: MatchServerMessage.BET_REQUEST,
            data: {
                playerId: playerId,
                options: this.matchService.getBetOptions(match, playerId),
                counter: counter,
            },
        });
    }

    async sendBet(match: Match, playerId: number, bet: number) {
        const resources = this.matchService.getMatchResources(match);

        resources.forEach((r) => {
            this.server.to(r.clientId).emit(this.msgKey, {
                code: MatchServerMessage.BET,
                data: {
                    playerId: playerId,
                    bet: bet,
                },
            });
        });
    }

    async sendTurnStart(match: Match) {
        const resources = this.matchService.getMatchResources(match);

        resources.forEach((r) => {
            this.server.to(r.clientId).emit(this.msgKey, {
                code: MatchServerMessage.TURN_START,
                data: {
                    cards: r.cards,
                    match: r.match,
                },
            });
        });
    }

    async sendRequestPlay(match: Match, playerId: number, counter: number) {
        this.server.to('match_' + match.id).emit(this.msgKey, {
            code: MatchServerMessage.PLAY_REQUEST,
            data: {
                playerId: playerId,
                counter: counter,
            },
        });
    }

    async sendPlay(match: Match, playerId: number, card: number) {
        const resources = this.matchService.getMatchResources(match);

        resources.forEach((r) => {
            this.server.to(r.clientId).emit(this.msgKey, {
                code: MatchServerMessage.PLAY,
                data: {
                    playerId: playerId,
                    card: card,
                },
            });
        });
    }

    async sendTurnEnd(match: Match) {
        const resources = this.matchService.getMatchResources(match);

        resources.forEach((r) => {
            this.server.to(r.clientId).emit(this.msgKey, {
                code: MatchServerMessage.TURN_END,
                data: {
                    cards: r.cards,
                    match: r.match,
                },
            });
        });
    }

    async sendRoundEnd(match: Match) {
        const resources = this.matchService.getMatchResources(match);

        resources.forEach((r) => {
            this.server.to(r.clientId).emit(this.msgKey, {
                code: MatchServerMessage.ROUND_END,
                data: {
                    cards: r.cards,
                    match: r.match,
                },
            });
        });
    }

    async sendMatchEnd(match: Match) {
        const resources = this.matchService.getMatchResources(match);

        resources.forEach((r) => {
            this.server.to(r.clientId).emit(this.msgKey, {
                code: MatchServerMessage.MATCH_END,
                data: {
                    cards: r.cards,
                    match: r.match,
                },
            });
        });
    }

    async sendPlayerStatus(match: Match) {
        const resources = this.matchService.getMatchResources(match);

        resources.forEach((r) => {
            this.server.to(r.clientId).emit(this.msgKey, {
                code: MatchServerMessage.PLAYER_STATUS,
                data: {
                    cards: r.cards,
                    match: r.match,
                },
            });
        });
    }
}
