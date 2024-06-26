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

@Injectable()
export class MatchService {
    matchs: Match[] = [
        {
            id: 1,
            littleCorner: null,
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
            sky: 1,
            status: MatchStatus.STARTED,
        },
    ];

    constructor(private prisma: PrismaService) {}

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

        this.matchs.push(match);

        return match;
    }
}
