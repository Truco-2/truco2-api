import { Injectable } from '@nestjs/common';
import { Match } from '../../interfaces/match.interface';
import {
    MatchStatus,
    PlayerStatus,
    PlayerType,
    RoundStatus,
    TurnStatus,
} from 'src/common/enums/match.enum';

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

    async list(): Promise<Match[]> {
        return this.matchs;
    }
}
