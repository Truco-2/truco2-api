import { PlayerStatus, PlayerType } from 'src/common/enums/match.enum';
import { User } from './user.interface';

export interface Player {
    id: number;
    status: PlayerStatus;
    user: User;
    type: PlayerType;
    bet: number | null;
    cardsOnNextRound: number;
    cardsOnHand: number;
    cards: number[];
    socketClientId: number | null;
}
