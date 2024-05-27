export interface IRoomResource {
    name: string;
    maxPlayers: number;
    isPrivate: boolean;
    password?: string;
}
