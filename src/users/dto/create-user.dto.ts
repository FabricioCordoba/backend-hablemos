import { IsEmail, IsNotEmpty, MinLength, IsOptional, IsString } from 'class-validator';

export class CreateUserDto {

    @IsEmail()
    email!: string;

    @IsNotEmpty()
    @MinLength(6)
    password!: string;

    @IsNotEmpty()
    pseudonym!: string;

    @IsOptional()
    @IsString()
    avatar?: string;
}