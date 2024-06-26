import { MatchStatus } from 'src/common/enums/match.enum';
import { Player } from './player.interface';
import { Round } from './round.interface';

export interface Match {
    id: number;
    status: MatchStatus;
    players: Player[];
    littleCorner: number | null;
    sky: number | null;
    round: Round;
}
