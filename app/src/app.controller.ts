import { Controller, Request, Post, UseGuards, Get } from '@nestjs/common';

import { LocalAuthGuard } from './auth/local/local-auth.guard';
// import { JwtAuthGuard } from './auth/jwt/jwt-auth.guard';
import { AuthService } from './auth/auth.service';
import { UsersService } from './services/users/users.service';

@Controller()
export class AppController {
    constructor(
        private authService: AuthService,
        private userService: UsersService,
    ) {}

    @UseGuards(LocalAuthGuard)
    @Post('login')
    async login(@Request() req) {
        return this.authService.login(req.user);
    }

    //@UseGuards(JwtAuthGuard)
    @Get('guest')
    async guest() {
        const user = await this.userService.generateGuestUser();
        return this.authService.login(user);
    }
}
