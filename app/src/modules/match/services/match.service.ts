import { Injectable } from '@nestjs/common';
import {
    MatchStatus,
    PlayerStatus,
    PlayerType,
    RoundStatus,
    TurnStatus,
} from 'src/common/enums/match.enum';
import { Match } from '../interfaces/match.interface';
import { PrismaService } from 'src/providers/prisma/prisma.service';
import { Player } from '../interfaces/player.interface';

@Injectable()
export class MatchService {
    matchs: Match[] = [
        {
            id: 1,
            littleCorner: null,
            sky: 1,
            status: MatchStatus.STARTED,
            unsedCards: [],
            players: [
                {
                    id: 1,
                    user: {
                        id: 1,
                        name: 'Nelson',
                    },
                    type: PlayerType.USER,
                    cards: [1, 2, 3, 4, 5],
                    bet: 2,
                    cardsOnNextRound: 5,
                    status: PlayerStatus.ONLINE,
                    socketClientId: 1,
                },
            ],
            round: {
                id: 1,
                losers: [],
                trumpCard: 10,
                status: RoundStatus.STARTED,
                turn: {
                    id: 1,
                    plays: [
                        {
                            cardId: 1,
                            id: 1,
                            playerId: 1,
                        },
                    ],
                    playOrder: [1],
                    status: TurnStatus.STARTED,
                    winner: 1,
                },
            },
        },
    ];

    constructor(private prisma: PrismaService) {}

    randomIntFromInterval(min: number, max: number): number {
        return Math.floor(Math.random() * (max - min + 1) + min);
    }

    getCardFromDeck(match: Match): number {
        const cardIndex = this.randomIntFromInterval(
            0,
            match.unsedCards.length - 1,
        );
        const card: number = match.unsedCards[cardIndex];

        match.unsedCards.splice(cardIndex, 1);

        return card;
    }

    async list(): Promise<Match[]> {
        return this.matchs;
    }

    async create(roomId: number): Promise<Match> {
        const room = await this.prisma.room.findFirst({
            where: {
                id: roomId,
            },
            include: {
                usersRooms: {
                    include: {
                        user: true,
                    },
                },
            },
        });

        if (!room) {
            throw new Error('room not found');
        }

        const match: Match = {
            id: this.matchs.length + 1,
            littleCorner: null,
            players: [],
            round: null,
            sky: null,
            status: MatchStatus.STARTED,
            unsedCards: [...Array(40).keys()],
        };

        room.usersRooms.forEach((user) => {
            match.players.push({
                bet: null,
                cards: [],
                cardsOnNextRound: 5,
                id: user.userId,
                socketClientId: null,
                status: PlayerStatus.OFFLINE,
                type: PlayerType.USER,
                user: {
                    id: user.userId,
                    name: user.user.name,
                },
            });
        });

        this.startRound(match);

        this.startTurn(match);

        this.sortCards(match);

        // this.matchs.push(match);

        return match;
    }

    startRound(match: Match): void {
        match.round = {
            id: 1,
            losers: [],
            status: RoundStatus.STARTED,
            trumpCard: this.getCardFromDeck(match),
            turn: null,
        };
    }

    startTurn(match: Match): void {
        match.round.turn = {
            id: 1,
            playOrder: this.getPlayerOrder(match.players),
            plays: [],
            status: TurnStatus.STARTED,
            winner: null,
        };
    }

    getPlayerOrder(players: Player[], first: number | null = null): number[] {
        const order = players.map((player) => player.id);

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

            for (let i = 0; i < player.cardsOnNextRound; i++) {
                player.cards.push(this.getCardFromDeck(match));
            }
        });
    }
}
