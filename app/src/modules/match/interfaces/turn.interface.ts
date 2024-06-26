import { TurnStatus } from 'src/common/enums/match.enum';
import { Play } from './play.interface';

export interface Turn {
    id: number;
    status: TurnStatus;
    winner: number;
    playOrder: number[];
    plays: Play[];
}
