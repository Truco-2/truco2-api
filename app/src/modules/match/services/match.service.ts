import { Injectable } from '@nestjs/common';
import {
    MatchStatus,
    PlayerStatus,
    PlayerType,
} from 'src/common/enums/match.enum';
import { Match } from '../interfaces/match.interface';
import { PrismaService } from 'src/providers/prisma/prisma.service';
import { Player } from '../interfaces/player.interface';

@Injectable()
export class MatchService {
    clients: {
        userId: number;
        clientId: string;
    }[] = [];

    matchs: Match[] = [];

    constructor(private prisma: PrismaService) {}

    randomIntFromInterval(min: number, max: number): number {
        return Math.floor(Math.random() * (max - min + 1) + min);
    }

    getCardFromDeck(match: Match): number {
        const cardIndex = this.randomIntFromInterval(
            0,
            match.unsedCards.length - 1,
        );
        const card: number = match.unsedCards[cardIndex];

        match.unsedCards.splice(cardIndex, 1);

        return card;
    }

    async list(): Promise<Match[]> {
        return this.matchs;
    }

    async enter(
        matchId: number,
        userId: number,
        clientId: string,
    ): Promise<Match> {
        const client = this.clients.find((client) => client.userId == userId);

        if (!client) {
            this.clients.push({
                clientId: clientId,
                userId: userId,
            });
        }

        const match = this.matchs.find((match) => match.id == matchId);

        if (!match) {
            throw new Error('Match not found');
        }

        const player = match.players.find((player) => player.user.id == userId);

        if (!player) {
            throw new Error('Player not found');
        }

        player.socketClientId = clientId;
        player.status = PlayerStatus.ONLINE;

        return match;
    }

    async makeBet(
        matchId: number,
        bet: number,
        clientId: string,
    ): Promise<Match> {
        const client = this.clients.find(
            (client) => client.clientId == clientId,
        );

        const match = this.matchs.find((match) => match.id == matchId);

        if (!match) {
            throw new Error('Match not found');
        }

        if (match.status != MatchStatus.REQUESTING_BETS) {
            throw new Error('Match is not requesting bet');
        }

        const nextPlayer: Player | null = this.nextPlayerToBet(match);

        if (!nextPlayer) {
            throw new Error('There is no player to bet');
        }

        const player = match.players.find(
            (player) => player.user.id == client.userId,
        );

        if (!player) {
            throw new Error('Player not found');
        }

        if (player.id != nextPlayer.id) {
            throw new Error('Not players turn');
        }

        const betOptions = this.getBetOptions(match, player.id);

        if (!betOptions.includes(bet)) {
            throw new Error('Bet invalide');
        }

        player.bet = bet;

        return match;
    }

    async makePlay(
        matchId: number,
        card: number,
        clientId: string,
    ): Promise<Match> {
        const client = this.clients.find(
            (client) => client.clientId == clientId,
        );

        const match = this.matchs.find((match) => match.id == matchId);

        if (!match) {
            throw new Error('Match not found');
        }

        if (match.status != MatchStatus.REQUESTING_PLAYS) {
            throw new Error('Match is not requesting plays');
        }

        const nextPlayer: Player | null = this.nextPlayerToPlay(match);

        if (!nextPlayer) {
            throw new Error('There is no player to play');
        }

        const player = match.players.find(
            (player) => player.user.id == client.userId,
        );

        if (!player) {
            throw new Error('Player not found');
        }

        if (player.id != nextPlayer.id) {
            throw new Error('Not players turn');
        }

        if (!player.cards.includes(card)) {
            throw new Error('Play invalide');
        }

        player.cards.splice(
            player.cards.findIndex((c) => c == card),
            1,
        );

        player.cardsOnHand = player.cards.length;

        player.play = {
            cardId: card,
            id: 0,
        };

        return match;
    }

    async makeBetBot(matchId: number, playerId: number): Promise<Match> {
        const match = this.matchs.find((match) => match.id == matchId);

        if (!match) {
            throw new Error('Match not found');
        }

        if (match.status != MatchStatus.REQUESTING_BETS) {
            throw new Error('Match is not requesting bet');
        }

        const nextPlayer: Player | null = this.nextPlayerToBet(match);

        if (!nextPlayer) {
            throw new Error('There is no player to bet');
        }

        const player = match.players.find((player) => player.id == playerId);

        if (!player) {
            throw new Error('Player not found');
        }

        if (player.id != nextPlayer.id) {
            throw new Error('Not players turn');
        }

        const betOptions = this.getBetOptions(match, player.id);

        player.bet =
            betOptions[this.randomIntFromInterval(0, betOptions.length - 1)];

        return match;
    }

    async makePlayBot(matchId: number, playerId: number): Promise<Match> {
        const match = this.matchs.find((match) => match.id == matchId);

        if (!match) {
            throw new Error('Match not found');
        }

        if (match.status != MatchStatus.REQUESTING_PLAYS) {
            throw new Error('Match is not requesting plays');
        }

        const nextPlayer: Player | null = this.nextPlayerToPlay(match);

        if (!nextPlayer) {
            throw new Error('There is no player to play');
        }

        const player = match.players.find((player) => player.id == playerId);

        if (!player) {
            throw new Error('Player not found');
        }

        if (player.id != nextPlayer.id) {
            throw new Error('Not players turn');
        }

        const card =
            player.cards[
                this.randomIntFromInterval(0, player.cards.length - 1)
            ];

        player.cards.splice(
            player.cards.findIndex((c) => c == card),
            1,
        );

        player.cardsOnHand = player.cards.length;

        player.play = {
            cardId: card,
            id: 0,
        };

        return match;
    }

    async create(roomCode: string): Promise<Match> {
        const room = await this.prisma.room.findFirst({
            where: {
                code: roomCode,
            },
            include: {
                usersRooms: {
                    include: {
                        user: true,
                    },
                },
            },
        });

        if (!room) {
            throw new Error('room not found');
        }

        const matchExist = this.matchs.find(
            (match) => match.roomCode == roomCode,
        );

        if (matchExist) {
            return matchExist;
        }

        const match: Match = {
            id: this.matchs.length + 1,
            roomCode: roomCode,
            littleCorner: null,
            players: [],
            sky: null,
            status: MatchStatus.STARTING,
            unsedCards: [...Array(40).keys()],
            tableCard: null,
            playOrder: [],
            turn: 1,
            turnsLeft: 1,
            round: 1,
        };

        room.usersRooms.forEach((user) => {
            match.players.push({
                bet: null,
                wins: 0,
                cards: [],
                cardsOnNextRound: 5,
                cardsOnHand: 5,
                id: user.userId,
                socketClientId: null,
                status: PlayerStatus.OFFLINE,
                type: PlayerType.USER,
                user: {
                    id: user.userId,
                    name: user.user.name,
                },
                play: null,
            });
        });

        this.startRound(match);

        this.sortCards(match);

        this.startTurn(match);

        this.matchs.push(match);

        return match;
    }

    startRound(match: Match): void {
        match.unsedCards = [...Array(40).keys()];
        match.tableCard = this.getCardFromDeck(match);
    }

    startTurn(match: Match): void {
        match.playOrder = this.getPlayerOrder(match.players);
    }

    getPlayerOrder(players: Player[], first: number | null = null): number[] {
        const order = [];
        players.forEach((player) => {
            if (player.cards.length > 0) {
                order.push(player.id);
            }
        });

        if (first) {
            const firstIndex = order.findIndex((id) => id == first);

            if (firstIndex < 0) {
                throw new Error('error on sorting players');
            }

            for (let i = 0; i < firstIndex; i++) {
                order.push(order[0]);
                order.shift();
            }
        }

        return order;
    }

    sortCards(match: Match): void {
        match.players.forEach((player) => {
            player.cards = [];
            player.cardsOnHand = player.cardsOnNextRound;

            for (let i = 0; i < player.cardsOnNextRound; i++) {
                player.cards.push(this.getCardFromDeck(match));
            }
        });

        match.turnsLeft = this.getTurnsNumber(match);
    }

    verifyBetsRequest(match: Match): number {
        match.status = MatchStatus.REQUESTING_BETS;

        if (
            match.players.find(
                (player) => player.cards.length < player.cardsOnNextRound,
            )
        ) {
            this.sortCards(match);
        }

        const nextPlayer: Player | null = this.nextPlayerToBet(match);

        if (nextPlayer) {
            return nextPlayer.id;
        }

        match.status = MatchStatus.REQUESTING_PLAYS;

        return -1;
    }

    verifyPlaysRequest(match: Match): number {
        match.status = MatchStatus.REQUESTING_PLAYS;

        const nextPlayer: Player | null = this.nextPlayerToPlay(match);

        if (nextPlayer) {
            return nextPlayer.id;
        }

        match.status = MatchStatus.FINISHED;

        return -1;
    }

    nextPlayerToBet(match: Match): Player | null {
        for (let i = 0; i < match.playOrder.length; i++) {
            const player = match.players.find(
                (p) => p.id == match.playOrder[i],
            );

            if (player.type == PlayerType.USER && player.bet == null) {
                return player;
            }
        }

        return null;
    }

    nextPlayerToPlay(match: Match): Player | null {
        for (let i = 0; i < match.playOrder.length; i++) {
            const player = match.players.find(
                (p) => p.id == match.playOrder[i],
            );

            if (!player.play) {
                return player;
            }
        }

        return null;
    }

    getBetOptions(match: Match, playerId: number): number[] {
        const turnsNumber = this.getTurnsNumber(match);

        const options = [...Array(turnsNumber + 1).keys()];

        if (match.playOrder[match.playOrder.length - 1] == playerId) {
            const sumPlayersBets = this.getSumPlayerBets(match);

            if (sumPlayersBets <= turnsNumber) {
                options.splice(
                    options.findIndex((o) => o == turnsNumber - sumPlayersBets),
                    1,
                );
            }
        }

        return options;
    }

    getTurnsNumber(match: Match): number {
        const cardNumbers: number[] = match.players.map((p) => p.cards.length);
        cardNumbers.sort();
        return cardNumbers.find((cardNumber) => cardNumber != 0);
    }

    getSumPlayerBets(match: Match): number {
        let sumBets = 0;

        match.players.forEach((player) => {
            if (player.bet) {
                sumBets += player.bet;
            }
        });

        return sumBets;
    }

    calculateTurnWinner(match: Match): Player {
        const trumpPartition = Math.floor(match.tableCard / 4);

        const plays: { playerId: number; card: number }[] = match.players.map(
            (p) => {
                return { playerId: p.id, card: p.play.cardId };
            },
        );

        plays.forEach((play) => {
            if (Math.floor(play.card / 4) == trumpPartition) {
                play.card += 100;
            }
        });

        plays.sort((a, b) => b.card - a.card);

        const winnerId = plays[0].playerId;

        const winnerPlayer = match.players.find((p) => p.id == winnerId);

        return winnerPlayer;
    }

    startNextTurn(match: Match, winner: Player) {
        winner.wins++;

        match.turnsLeft--;

        if (match.turnsLeft <= 0) {
            this.calculateRoundLosers(match);

            match.turn = 1;
            match.round++;

            this.startRound(match);

            this.sortCards(match);
        }

        match.players.forEach((p) => (p.play = null));

        match.status = MatchStatus.REQUESTING_PLAYS;

        match.playOrder = this.getPlayerOrder(match.players, winner.id);

        if (match.playOrder.length > 1) {
            match.status = MatchStatus.REQUESTING_PLAYS;
        } else {
            match.status = MatchStatus.FINISHED;
        }
    }

    calculateRoundLosers(match: Match) {
        match.players.forEach((p) => {
            if (p.bet != p.wins && p.cardsOnNextRound > 0) {
                p.cardsOnNextRound--;
                p.bet = 0;
                p.wins = 0;
            }

            p.cards = [];
        });
    }
}
