import { Expose, Type } from 'class-transformer';

export class UserInformation {
    @Expose()
    id: number;

    @Expose()
    name: string;

    @Expose()
    email: string;

    @Expose()
    @Type(() => UserRoomResource)
    usersRooms: UserRoomResource[];
}

export class UserRoomResource {
    @Expose()
    id: number;

    @Expose()
    name: string;

    @Expose()
    maxPlayers: string;

    @Expose()
    status: number;
}
