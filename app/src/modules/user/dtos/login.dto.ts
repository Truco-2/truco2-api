import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEmail, IsString, Length } from 'class-validator';

export class LoginDto {
    @ApiProperty()
    @IsEmail()
    @IsString()
    @Transform(({ value }) => value?.trim())
    email: string;

    @ApiProperty()
    @IsString()
    @Length(5, 50)
    @Transform(({ value }) => value?.trim())
    password: string;
}
