import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';

export class CreateMatchDto {
    @ApiProperty()
    @IsNumber()
    roomId: number;
}
