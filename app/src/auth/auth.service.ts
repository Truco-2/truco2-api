import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from 'src/modules/user/services/user.service';

@Injectable()
export class AuthService {
    constructor(
        private userService: UserService,
        private jwtService: JwtService,
    ) {}

    async validateUser(username: string, pass: string): Promise<any> {
        const user = await this.userService.userByName(username);
        if (user && user.password === pass) {
            delete user.password;
            return user;
        }
        return null;
    }

    async validateUserByEmail(email: string, password: string): Promise<any> {
        const user = await this.userService.userByEmail(email);

        if (user && user.password === password) {
            delete user.password;

            return user;
        }

        return null;
    }

    async login(user: {
        id: number;
        name: string;
    }): Promise<{ access_token: string }> {
        const payload = { username: user.name, sub: user.id };
        return {
            access_token: this.jwtService.sign(payload),
        };
    }
}
