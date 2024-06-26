import {
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer,
} from '@nestjs/websockets';
import { Match } from '../../interfaces/match.interface';

@WebSocketGateway({ namespace: 'match', cors: true })
export class MatchGateway {
    @WebSocketServer() server;

    matchs: Match[] = [];

    // @SubscribeMessage('message')
    // handleMessage(client: any, payload: any): string {
    //     return 'Hello world!';
    // }

    sendList(): void {
        this.server.emit('match-msg', this.matchs);
    }

    @SubscribeMessage('create-match')
    handleMessage(): void {
        if (this.matchs.length == 0) {
            this.matchs.push({
                id: 1,
            });
        } else {
            this.matchs.push({
                id: this.matchs[this.matchs.length - 1].id + 1,
            });
        }

        this.sendList();
    }
}
