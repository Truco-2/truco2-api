import { ApiProperty } from '@nestjs/swagger';
import {
    IsBoolean,
    IsNumber,
    IsString,
    Length,
    Max,
    Min,
} from 'class-validator';

export class RoomResourceDto {
    @ApiProperty()
    @IsString()
    @Length(3, 20)
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
    password?: string;
}
