import { MatchStatus } from 'src/common/enums/match.enum';
import { Player, PlayerResouce } from './player.interface';

export interface Match {
    id: number;
    status: MatchStatus;
    roomCode: string;
    players: Player[];
    littleCorner: number | null;
    sky: number | null;
    tableCard: number | null;
    playOrder: number[];
    deck: number[];
    turn: number;
    turnsLeft: number;
    round: number;
}

export interface MatchResouce {
    id: number;
    status: MatchStatus;
    roomCode: string;
    turn: number;
    turnsLeft: number;
    round: number;
    littleCorner: number | null;
    sky: number | null;
    tableCard: number | null;
    playOrder: number[];
    players: PlayerResouce[];
}
