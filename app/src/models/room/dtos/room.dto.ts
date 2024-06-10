import { ApiProperty } from '@nestjs/swagger';
import { Expose, Transform, Type } from 'class-transformer';
import {
    IsBoolean,
    IsNotEmpty,
    IsNumber,
    IsString,
    Length,
    Matches,
    Max,
    Min,
    ValidateIf,
    ValidateNested,
} from 'class-validator';
import exp from 'constants';

export class OwnerResource {
    @Expose()
    id: number;
    @Expose()
    name: string;
}

export class UserResource {
    @Expose()
    id: string;
    @Expose()
    name: UsersRoomsResource[];
}

export class UsersRoomsResource {
    @Expose()
    @Type(() => UserResource)
    user: UserResource;
}

export class RoomDto {
    @Expose()
    id: number;

    @Expose()
    code: string;

    @ApiProperty()
    @IsString()
    @Matches(/^[a-zA-Z0-9.]*$/, {
        message: 'Room must not have any special symbol',
    })
    @Length(3, 20)
    @Transform(({ value }) => value?.trim())
    @Expose()
    name: string;

    @ApiProperty()
    @IsNumber()
    @Min(2)
    @Max(7)
    @Expose()
    maxPlayers: number;

    @ApiProperty()
    @IsBoolean()
    @Expose()
    isPrivate: boolean;

    @ApiProperty()
    @ValidateIf((o) => o.isPrivate === true)
    @Transform(({ value }) => value?.trim())
    @IsNotEmpty()
    password?: string;

    @Type(() => OwnerResource)
    @Expose()
    owner: OwnerResource;

    @ValidateNested({ each: true })
    @Type(() => UsersRoomsResource)
    @Expose()
    UsersRooms: UsersRoomsResource[];
}
