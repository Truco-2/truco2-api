import { ApiProperty } from '@nestjs/swagger';

export class RoomResourceDto {
    @ApiProperty()
    name: string;
    @ApiProperty()
    maxPlayers: number;
    @ApiProperty()
    isPrivate: boolean;
    @ApiProperty()
    password?: string;
}
