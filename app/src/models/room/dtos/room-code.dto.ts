import { ApiProperty } from '@nestjs/swagger';
import { IsAlphanumeric, IsString, Length } from 'class-validator';

export class RoomCodeDto {
    @ApiProperty()
    @IsString()
    @IsAlphanumeric()
    @Length(6, 6)
    code: string;
}
