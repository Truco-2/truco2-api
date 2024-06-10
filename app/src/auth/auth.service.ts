import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from 'src/services/user/user.service';

@Injectable()
export class AuthService {
    constructor(
        private UserService: UserService,
        private jwtService: JwtService,
    ) {}

    async validateUser(username: string, pass: string): Promise<any> {
        const user = await this.UserService.userByName(username);
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
