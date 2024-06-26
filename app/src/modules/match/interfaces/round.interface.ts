import { RoundStatus } from 'src/common/enums/match.enum';
import { Turn } from './turn.interface';

export interface Round {
    id: number;
    status: RoundStatus;
    trumpCard: number;
    losers: number[];
    turn: Turn;
}
