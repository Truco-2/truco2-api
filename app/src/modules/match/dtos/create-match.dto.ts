import { ApiProperty } from '@nestjs/swagger';

export class CreateMatchDto {
    @ApiProperty()
    roomCode: string;
}
