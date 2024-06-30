import { Injectable } from '@nestjs/common';
import {
    MatchStatus,
    PlayerStatus,
    PlayerType,
} from 'src/common/enums/match.enum';
import { Match, MatchResouce } from '../interfaces/match.interface';
import { PrismaService } from 'src/providers/prisma/prisma.service';
import { Player } from '../interfaces/player.interface';
import { RoomStatus } from 'src/common/enums/room-status.enum';

@Injectable()
export class MatchService {
    clients: {
        userId: number;
        clientId: string;
        matchId: number;
    }[] = [];

    matchs: Match[] = [];

    constructor(private prisma: PrismaService) {}

    randomIntFromInterval(min: number, max: number): number {
        return Math.floor(Math.random() * (max - min + 1) + min);
    }

    getCardFromDeck(match: Match): number {
        const cardIndex = this.randomIntFromInterval(0, match.deck.length - 1);
        const card: number = match.deck[cardIndex];

        match.deck.splice(cardIndex, 1);

        return card;
    }

    async list(): Promise<Match[]> {
        return this.matchs;
    }

    async enter(userId: number, clientId: string): Promise<Match> {
        const client = this.clients.find((client) => client.userId == userId);

        if (!client) {
            throw new Error('Player not found');
        }

        client.clientId = clientId;

        const match = this.matchs.find((match) => match.id == client.matchId);

        if (!match) {
            throw new Error('Match not found');
        }

        const player = match.players.find((player) => player.user.id == userId);

        if (!player) {
            throw new Error('Player not found');
        }

        player.socketClientId = clientId;
        player.status = PlayerStatus.ONLINE;

        return match;
    }

    async makeBet(bet: number, clientId: string): Promise<Match> {
        const client = this.clients.find(
            (client) => client.clientId == clientId,
        );

        const match = this.matchs.find((match) => match.id == client.matchId);

        if (!match) {
            throw new Error('Match not found');
        }

        if (match.status != MatchStatus.REQUESTING_BETS) {
            throw new Error('Match is not requesting bet');
        }

        const nextPlayer: Player | null = this.nextPlayerToBet(match);

        if (!nextPlayer) {
            throw new Error('There is no player to bet');
        }

        const player = match.players.find(
            (player) => player.user.id == client.userId,
        );

        if (!player) {
            throw new Error('Player not found');
        }

        if (player.id != nextPlayer.id) {
            throw new Error('Not players turn');
        }

        const betOptions = this.getBetOptions(match, player.id);

        if (!betOptions.includes(bet)) {
            throw new Error('Bet invalide');
        }

        player.bet = bet;

        return match;
    }

    async makePlay(card: number, clientId: string): Promise<Match> {
        const client = this.clients.find(
            (client) => client.clientId == clientId,
        );

        const match = this.matchs.find((match) => match.id == client.matchId);

        if (!match) {
            throw new Error('Match not found');
        }

        if (match.status != MatchStatus.REQUESTING_PLAYS) {
            throw new Error('Match is not requesting plays');
        }

        const nextPlayer: Player | null = this.nextPlayerToPlay(match);

        if (!nextPlayer) {
            throw new Error('There is no player to play');
        }

        const player = match.players.find(
            (player) => player.user.id == client.userId,
        );

        if (!player) {
            throw new Error('Player not found');
        }

        if (player.id != nextPlayer.id) {
            throw new Error('Not players turn');
        }

        if (!player.cards.includes(card)) {
            throw new Error('Play invalide');
        }

        player.cards.splice(
            player.cards.findIndex((c) => c == card),
            1,
        );

        player.cardsOnHand = player.cards.length;

        player.play = {
            cardId: card,
            id: 0,
        };

        return match;
    }

    async makeBetBot(matchId: number, playerId: number): Promise<number> {
        const match = this.matchs.find((match) => match.id == matchId);

        if (!match) {
            throw new Error('Match not found');
        }

        if (match.status != MatchStatus.REQUESTING_BETS) {
            throw new Error('Match is not requesting bet');
        }

        const nextPlayer: Player | null = this.nextPlayerToBet(match);

        if (!nextPlayer) {
            throw new Error('There is no player to bet');
        }

        const player = match.players.find((player) => player.id == playerId);

        if (!player) {
            throw new Error('Player not found');
        }

        if (player.id != nextPlayer.id) {
            throw new Error('Not players turn');
        }

        const betOptions = this.getBetOptions(match, player.id);

        player.bet =
            betOptions[this.randomIntFromInterval(0, betOptions.length - 1)];

        return player.bet;
    }

    async makePlayBot(matchId: number, playerId: number): Promise<number> {
        const match = this.matchs.find((match) => match.id == matchId);

        if (!match) {
            throw new Error('Match not found');
        }

        if (match.status != MatchStatus.REQUESTING_PLAYS) {
            throw new Error('Match is not requesting plays');
        }

        const nextPlayer: Player | null = this.nextPlayerToPlay(match);

        if (!nextPlayer) {
            throw new Error('There is no player to play');
        }

        const player = match.players.find((player) => player.id == playerId);

        if (!player) {
            throw new Error('Player not found');
        }

        if (player.id != nextPlayer.id) {
            throw new Error('Not players turn');
        }

        const card =
            player.cards[
                this.randomIntFromInterval(0, player.cards.length - 1)
            ];

        player.cards.splice(
            player.cards.findIndex((c) => c == card),
            1,
        );

        player.cardsOnHand = player.cards.length;

        player.play = {
            cardId: card,
            id: 0,
        };

        return player.play.cardId;
    }

    async create(userId: number): Promise<Match> {
        const user = await this.prisma.user.findFirst({
            where: {
                AND: [
                    {
                        id: userId,
                    },
                    {
                        usersRooms: {
                            some: {
                                room: {
                                    AND: [
                                        {
                                            status: RoomStatus.WAITING,
                                        },
                                        {
                                            ownerId: userId,
                                        },
                                    ],
                                },
                            },
                        },
                    },
                ],
            },
            include: {
                usersRooms: {
                    include: {
                        room: {
                            include: {
                                usersRooms: {
                                    include: {
                                        user: true,
                                    },
                                },
                            },
                        },
                    },
                },
            },
        });

        if (!user) {
            throw new Error(
                'User is not in room or is not the room owner, or room is not in waiting status',
            );
        }

        const room = user.usersRooms[0].room;

        if (room.usersRooms.length < 2) {
            throw new Error('Room has not enough players');
        }

        const matchExist = this.matchs.find(
            (match) => match.roomCode == room.code,
        );

        if (matchExist) {
            return matchExist;
        }

        const match: Match = {
            id: this.matchs.length + 1,
            roomCode: room.code,
            littleCorner: null,
            players: [],
            sky: null,
            status: MatchStatus.STARTING,
            deck: [...Array(40).keys()],
            tableCard: null,
            playOrder: [],
            turn: 1,
            turnsLeft: 1,
            round: 1,
        };

        room.usersRooms.forEach((user) => {
            match.players.push({
                bet: null,
                wins: 0,
                cards: [],
                cardsOnNextRound: 5,
                cardsOnHand: 5,
                id: user.userId,
                socketClientId: null,
                status: PlayerStatus.OFFLINE,
                type: PlayerType.USER,
                user: {
                    id: user.userId,
                    name: user.user.name,
                },
                play: null,
            });

            this.clients.push({
                clientId: null,
                userId: user.userId,
                matchId: match.id,
            });
        });

        this.setDeck(match);

        this.setTableCard(match);

        this.sortCards(match);

        this.startTurn(match);

        this.matchs.push(match);

        return match;
    }

    setDeck(match: Match): void {
        match.deck = [...Array(40).keys()];
    }

    setTableCard(match: Match): void {
        match.tableCard = this.getCardFromDeck(match);
    }

    startTurn(match: Match): void {
        match.playOrder = this.getPlayerOrder(match.players);
    }

    getPlayerOrder(players: Player[], first: number | null = null): number[] {
        const order = [];
        players.forEach((player) => {
            if (player.cardsOnNextRound > 0) {
                order.push(player.id);
            }
        });

        if (first) {
            const firstIndex = order.findIndex((id) => id == first);

            if (firstIndex < 0) {
                throw new Error('error on sorting players');
            }

            for (let i = 0; i < firstIndex; i++) {
                order.push(order[0]);
                order.shift();
            }
        }

        return order;
    }

    sortCards(match: Match): void {
        match.players.forEach((player) => {
            player.cards = [];
            player.cardsOnHand = player.cardsOnNextRound;

            for (let i = 0; i < player.cardsOnNextRound; i++) {
                player.cards.push(this.getCardFromDeck(match));
            }
        });

        match.turnsLeft = this.getTurnsNumber(match);
    }

    verifyBetsRequest(match: Match): number {
        const nextPlayer: Player | null = this.nextPlayerToBet(match);

        if (nextPlayer) {
            return nextPlayer.id;
        }

        return -1;
    }

    verifyPlaysRequest(match: Match): number {
        const nextPlayer: Player | null = this.nextPlayerToPlay(match);

        if (nextPlayer) {
            return nextPlayer.id;
        }

        return -1;
    }

    nextPlayerToBet(match: Match): Player | null {
        for (let i = 0; i < match.playOrder.length; i++) {
            const player = match.players.find(
                (p) => p.id == match.playOrder[i],
            );

            if (player.type == PlayerType.USER && player.bet == null) {
                return player;
            }
        }

        return null;
    }

    nextPlayerToPlay(match: Match): Player | null {
        for (let i = 0; i < match.playOrder.length; i++) {
            const player = match.players.find(
                (p) => p.id == match.playOrder[i],
            );

            if (!player.play) {
                return player;
            }
        }

        return null;
    }

    getBetOptions(match: Match, playerId: number): number[] {
        const turnsNumber = this.getTurnsNumber(match);

        const options = [...Array(turnsNumber + 1).keys()];

        if (match.playOrder[match.playOrder.length - 1] == playerId) {
            const sumPlayersBets = this.getSumPlayerBets(match);

            if (sumPlayersBets <= turnsNumber) {
                options.splice(
                    options.findIndex((o) => o == turnsNumber - sumPlayersBets),
                    1,
                );
            }
        }

        return options;
    }

    getTurnsNumber(match: Match): number {
        const cardNumbers: number[] = match.players.map((p) => p.cards.length);
        cardNumbers.sort();
        return cardNumbers.find((cardNumber) => cardNumber != 0);
    }

    getSumPlayerBets(match: Match): number {
        let sumBets = 0;

        match.players.forEach((player) => {
            if (player.bet) {
                sumBets += player.bet;
            }
        });

        return sumBets;
    }

    calculateTurnWinner(match: Match): Player {
        let trumpPartition = Math.floor(match.tableCard / 4);

        trumpPartition = trumpPartition == 9 ? 1 : trumpPartition + 1;

        const plays: { playerId: number; card: number }[] = [];

        match.players.forEach((p) => {
            if (p.play) {
                plays.push({ playerId: p.id, card: p.play.cardId });
            }
        });

        plays.forEach((play) => {
            if (Math.floor(play.card / 4) == trumpPartition) {
                play.card += 100;
            }
        });

        plays.sort((a, b) => b.card - a.card);

        const winnerId = plays[0].playerId;

        const winnerPlayer = match.players.find((p) => p.id == winnerId);

        return winnerPlayer;
    }

    startNextTurn(match: Match, winner: Player): MatchStatus {
        winner.wins++;

        match.turnsLeft--;

        if (match.turnsLeft <= 0) {
            const losers: Player[] = this.calculateRoundLosers(match);

            losers.forEach((l) => {
                l.cardsOnNextRound--;
            });

            match.playOrder = this.getPlayerOrder(match.players);

            if (match.playOrder.length < 2) {
                return this.updateStatus(match, MatchStatus.FINISHED);
            } else {
                match.turn = 1;
                match.round++;

                this.setDeck(match);

                this.setTableCard(match);

                this.sortCards(match);

                match.players.forEach((p) => {
                    p.play = null;
                    p.bet = null;
                    p.wins = 0;
                });

                return this.updateStatus(match, MatchStatus.REQUESTING_BETS);
            }
        } else {
            match.turn++;

            match.players.forEach((p) => (p.play = null));

            match.playOrder = this.getPlayerOrder(match.players, winner.id);

            return this.updateStatus(match, MatchStatus.REQUESTING_PLAYS);
        }
    }

    calculateRoundLosers(match: Match): Player[] {
        const losers: Player[] = [];
        match.players.forEach((p) => {
            if (p.bet != p.wins && p.cardsOnNextRound > 0) {
                losers.push(p);
            }
        });

        return losers;
    }

    updateStatus(match: Match, status: MatchStatus): MatchStatus {
        match.status = status;
        return match.status;
    }

    getMatchResources(
        match: Match,
    ): { clientId: string; cards: number[]; match: MatchResouce }[] {
        const matchResource: MatchResouce = {
            id: match.id,
            status: match.status,
            roomCode: match.roomCode,
            round: match.round,
            turn: match.turn,
            turnsLeft: match.turnsLeft,
            littleCorner: match.littleCorner,
            sky: match.sky,
            tableCard: match.tableCard,
            playOrder: match.playOrder,
            players: match.players.map((p) => {
                return {
                    id: p.id,
                    status: p.status,
                    bet: p.bet,
                    cardsOnHand: p.cardsOnHand,
                    play: p.play,
                    type: p.type,
                    user: p.user,
                    wins: p.wins,
                };
            }),
        };

        const result = match.players.map((p) => {
            return {
                clientId: p.socketClientId,
                cards: p.cards,
                match: matchResource,
            };
        });

        return result;
    }

    getPlayerIdByClientId(clientId: string): number {
        const client = this.clients.find((c) => c.clientId == clientId);

        if (client) {
            return client.userId;
        }

        return null;
    }

    endMatch(match: Match): void {
        this.clients.forEach((c) => {
            if (c.matchId == match.id) {
                const index = this.clients.indexOf(c, 0);
                if (index > -1) {
                    this.clients.splice(index, 1);
                }
            }
        });

        const index = this.matchs.indexOf(match, 0);
        if (index > -1) {
            this.matchs.splice(index, 1);
        }
    }

    getClientsByMatch(match: Match): string[] {
        const clientIds: string[] = [];

        this.clients.forEach((c) => {
            if (c.matchId == match.id && c.clientId) {
                clientIds.push(c.clientId);
            }
        });

        return clientIds;
    }

    updateUserStatus(clientId: string, status: PlayerStatus): Match {
        const client = this.clients.find((c) => c.clientId == clientId);

        if (client) {
            const match = this.matchs.find((m) => m.id == client.matchId);

            if (match) {
                match.players.find(
                    (p) => p.socketClientId == client.clientId,
                ).status = status;

                return match;
            }
        }

        return null;
    }
}
