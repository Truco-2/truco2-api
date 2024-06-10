import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
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
} from 'class-validator';

export class RoomResourceDto {
    @ApiProperty()
    @IsString()
    @Matches(/^[a-zA-Z0-9.]*$/, {
        message: 'Room must not have any special symbol',
    })
    @Length(3, 20)
    @Transform(({ value }) => value?.trim())
    name: string;

    @ApiProperty()
    @IsNumber()
    @Min(2)
    @Max(7)
    maxPlayers: number;

    @ApiProperty()
    @IsBoolean()
    isPrivate: boolean;

    @ApiProperty()
    @ValidateIf((o) => o.isPrivate === true)
    @Transform(({ value }) => value?.trim())
    @IsNotEmpty({})
    password?: string;
}
