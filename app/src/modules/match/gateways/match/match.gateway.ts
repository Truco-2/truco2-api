import {
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer,
} from '@nestjs/websockets';
import { MatchService } from '../../services/match/match.service';

@WebSocketGateway({ namespace: 'match', cors: true })
export class MatchGateway {
    @WebSocketServer() server;

    constructor(private matchService: MatchService) {}
    async sendList(): Promise<void> {
        this.server.emit('match-msg', await this.matchService.list());
    }

    @SubscribeMessage('create-match')
    handleMessage(): void {
        this.sendList();
    }
}
