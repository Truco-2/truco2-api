export enum MatchStatus {
    STARTING = 'STARTING',
    REQUESTING_BETS = 'REQUESTING_BETS',
    REQUESTING_PLAYS = 'REQUESTING_PLAYS',
    TURN_FINISHED = 'TURN_FINISHED',
    FINISHED = 'FINISHED',
}

export enum MatchServerMessage {
    MATCH_START_TIMER = 'MATCH_START_TIMER',
    ROUND_START = 'ROUND_START',
    BET_REQUEST = 'BET_REQUEST',
    BET = 'BET',
    TURN_START = 'TURN_START',
    PLAY_REQUEST = 'PLAY_REQUEST',
    PLAY = 'PLAY',
    TURN_END = 'TURN_END',
    ROUND_END = 'ROUND_END',
    MATCH_END = 'MATCH_END',
    PLAYER_STATUS = 'PLAYER_STATUS',
}

export enum PlayerStatus {
    ONLINE = 'ONLINE',
    OFFLINE = 'OFFLINE',
}

export enum PlayerType {
    USER = 'USER',
    BOT = 'BOT',
}
