import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/services/users/users.service';

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private jwtService: JwtService,
    ) {}

    async validateUser(username: string, pass: string): Promise<any> {
        const user = await this.usersService.userByName(username);
        if (user && user.password === pass) {
            delete user.password;
            return user;
        }
        return null;
    }

    async login(user: any) {
        const payload = { username: user.name, sub: user.id };
        return {
            access_token: this.jwtService.sign(payload),
        };
    }
}
