import { MatchStatus } from 'src/common/enums/match.enum';
import { Player } from './player.interface';

export interface Match {
    id: number;
    status: MatchStatus;
    roomCode: string;
    players: Player[];
    littleCorner: number | null;
    sky: number | null;
    tableCard: number | null;
    playOrder: number[];
    unsedCards: number[];
    turn: number;
    turnsLeft: number;
    round: number;
}
