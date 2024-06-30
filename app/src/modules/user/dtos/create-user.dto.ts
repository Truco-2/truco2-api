import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEmail, IsString, Length, Matches } from 'class-validator';

export class CreateUserDto {
    @ApiProperty()
    @IsString()
    @Matches(/^[a-zA-Z0-9.\s]*$/, {
        message: 'Name must not have any special symbol',
    })
    @Length(3, 50)
    @Transform(({ value }) => value?.trim())
    name: string;

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
