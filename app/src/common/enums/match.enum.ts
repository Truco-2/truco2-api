export enum MatchStatus {
    STARTING = 1,
    REQUESTING_BETS = 2,
    REQUESTING_PLAYS = 3,
    FINISHED = 4,
}

export enum PlayerStatus {
    ONLINE = 1,
    OFFLINE = 2,
}

export enum RoundStatus {
    STARTED = 1,
    REQUESTING_BETS = 2,
    FINISHED = 3,
}

export enum TurnStatus {
    STARTED = 1,
    FINISHED = 2,
}

export enum PlayerType {
    USER = 1,
    BOT = 2,
}
