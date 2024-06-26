import { PlayerStatus, PlayerType } from 'src/common/enums/match.enum';
import { User } from './user.interface';
import { Play } from './play.interface';

export interface Player {
    id: number;
    status: PlayerStatus;
    user: User;
    type: PlayerType;
    bet: number | null;
    wins: number;
    cardsOnNextRound: number;
    cardsOnHand: number;
    cards: number[];
    socketClientId: string | null;
    play: Play | null;
}
