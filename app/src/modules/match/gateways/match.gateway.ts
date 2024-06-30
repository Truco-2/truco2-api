import {
    ConnectedSocket,
    MessageBody,
    OnGatewayDisconnect,
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer,
} from '@nestjs/websockets';
import { MatchService } from '../services/match.service';
import { Server, Socket } from 'socket.io';
import { Match } from '../interfaces/match.interface';
import {
    MatchServerMessage,
    MatchStatus,
    PlayerStatus,
} from 'src/common/enums/match.enum';
import { RoomService } from 'src/modules/room/services/room.service';
import { RoomStatus } from 'src/common/enums/room-status.enum';
import { UseFilters, UseGuards } from '@nestjs/common';
import { SocketIoExceptionFilter } from 'src/common/filters/socket-io-exception/socket-io-exception.filter';
import { JwtAuthGuard } from 'src/auth/jwt/jwt-auth.guard';
import { GetUser } from 'src/common/decorators/get-user/get-user.decorator';

@WebSocketGateway({ namespace: 'match', cors: true })
export class MatchGateway implements OnGatewayDisconnect {
    @WebSocketServer() server: Server;
    msgKey = 'match-msg';
    defaultCounter = 30;

    constructor(
        private matchService: MatchService,
        private roomService: RoomService,
    ) {}

    @UseFilters(SocketIoExceptionFilter)
    handleDisconnect(client: Socket) {
        const match = this.matchService.updateUserStatus(
            client.id,
            PlayerStatus.OFFLINE,
        );

        this.sendPlayerStatus(
            match,
            this.matchService.getPlayerIdByClientId(client.id),
            PlayerStatus.OFFLINE,
        );
    }

    @UseFilters(SocketIoExceptionFilter)
    @UseGuards(JwtAuthGuard)
    @SubscribeMessage('enter')
    async handleEnter(
        @GetUser() user: { userId: number; username: string },
        @ConnectedSocket() client: Socket,
    ): Promise<void> {
        const match = await this.matchService.enter(user.userId, client.id);

        client.join('match_' + match.id);

        this.sendPlayerStatus(
            match,
            this.matchService.getPlayerIdByClientId(client.id),
            PlayerStatus.ONLINE,
        );
    }

    @UseFilters(SocketIoExceptionFilter)
    @UseGuards(JwtAuthGuard)
    @SubscribeMessage('bet')
    async handleBet(
        @MessageBody() body: { bet: number },
        @ConnectedSocket() client: Socket,
    ): Promise<void> {
        const match = await this.matchService.makeBet(body.bet, client.id);

        client.join('match_' + match.id);

        this.sendBet(
            match,
            this.matchService.getPlayerIdByClientId(client.id),
            body.bet,
        );
    }

    @UseFilters(SocketIoExceptionFilter)
    @UseGuards(JwtAuthGuard)
    @SubscribeMessage('play')
    async handlePlay(
        @MessageBody() body: { card: number },
        @ConnectedSocket() client: Socket,
    ): Promise<void> {
        const match = await this.matchService.makePlay(body.card, client.id);

        client.join('match_' + match.id);

        this.sendPlay(
            match,
            this.matchService.getPlayerIdByClientId(client.id),
            body.card,
        );
    }

    @UseFilters(SocketIoExceptionFilter)
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

                    this.sendRoundStart(match);

                    setTimeout(() => {
                        this.requestBets(match, this.defaultCounter);
                    }, 1000);
                }
            }
        }, 1000);
    }

    @UseFilters(SocketIoExceptionFilter)
    async requestBets(
        match: Match,
        counter: number,
        latsId: number = -10,
    ): Promise<void> {
        const playerId = this.matchService.verifyBetsRequest(match);

        if (playerId != latsId) {
            counter = this.defaultCounter;
        }

        if (match.status == MatchStatus.REQUESTING_BETS && playerId > -1) {
            this.sendRequestBet(match, playerId, counter);

            counter--;

            if (counter > 0) {
                setTimeout(() => {
                    this.requestBets(match, counter, playerId);
                }, 1000);
            } else {
                const bet = await this.matchService.makeBetBot(
                    match.id,
                    playerId,
                );

                this.sendBet(match, playerId, bet);

                setTimeout(() => {
                    this.requestBets(match, this.defaultCounter);
                }, 1000);
            }
        } else {
            this.matchService.updateStatus(match, MatchStatus.REQUESTING_PLAYS);

            this.sendTurnStart(match);

            setTimeout(() => {
                this.requestPlays(match, this.defaultCounter);
            }, 1000);
        }
    }

    @UseFilters(SocketIoExceptionFilter)
    async requestPlays(
        match: Match,
        counter: number,
        latsId: number = -10,
    ): Promise<void> {
        const playerId = this.matchService.verifyPlaysRequest(match);

        if (playerId != latsId) {
            counter = this.defaultCounter;
        }

        if (match.status == MatchStatus.REQUESTING_PLAYS && playerId > -1) {
            this.sendRequestPlay(match, playerId, counter);

            counter--;

            if (counter > 0) {
                setTimeout(() => {
                    this.requestPlays(match, counter, playerId);
                }, 1000);
            } else {
                const card = await this.matchService.makePlayBot(
                    match.id,
                    playerId,
                );

                this.sendPlay(match, playerId, card);

                setTimeout(() => {
                    this.requestPlays(match, this.defaultCounter);
                }, 1000);
            }
        } else {
            this.matchService.updateStatus(match, MatchStatus.TURN_FINISHED);

            const winner = this.matchService.calculateTurnWinner(match);

            const losers = this.matchService.calculateRoundLosers(match);

            const status = this.matchService.startNextTurn(match, winner);

            this.sendTurnEnd(match, winner.id);

            if (status == MatchStatus.REQUESTING_PLAYS) {
                this.sendTurnStart(match);
                setTimeout(() => {
                    this.requestPlays(match, this.defaultCounter);
                }, 1000);
            } else if (status == MatchStatus.REQUESTING_BETS) {
                this.sendRoundEnd(
                    match,
                    losers.map((l) => l.id),
                );

                this.sendRoundStart(match);

                setTimeout(() => {
                    this.requestBets(match, this.defaultCounter);
                }, 1000);
            } else {
                this.sendRoundEnd(
                    match,
                    losers.map((l) => l.id),
                );

                this.sendMatchEnd(match);

                this.roomService.updateStatus(
                    match.roomCode,
                    RoomStatus.WAITING,
                );

                this.matchService.endMatch(match);
            }
        }
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
        this.server.to('match_' + match.id).emit(this.msgKey, {
            code: MatchServerMessage.BET,
            data: {
                playerId: playerId,
                bet: bet,
            },
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
        this.server.to('match_' + match.id).emit(this.msgKey, {
            code: MatchServerMessage.PLAY,
            data: {
                playerId: playerId,
                card: card,
            },
        });
    }

    async sendTurnEnd(match: Match, winnerId: number) {
        this.server.to('match_' + match.id).emit(this.msgKey, {
            code: MatchServerMessage.TURN_END,
            data: {
                winnerId: winnerId,
            },
        });
    }

    async sendRoundEnd(match: Match, losers: number[]) {
        this.server.to('match_' + match.id).emit(this.msgKey, {
            code: MatchServerMessage.ROUND_END,
            data: {
                losers: losers,
            },
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

    async sendPlayerStatus(
        match: Match,
        playerId: number,
        status: PlayerStatus,
    ) {
        const resources = this.matchService.getMatchResources(match);

        resources.forEach((r) => {
            this.server.to(r.clientId).emit(this.msgKey, {
                code: MatchServerMessage.PLAYER_STATUS,
                data: {
                    playerId: playerId,
                    status: status,
                    cards: r.cards,
                    match: r.match,
                },
            });
        });
    }
}
