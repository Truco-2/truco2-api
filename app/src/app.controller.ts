import { Controller, Request, Post, UseGuards, Get } from '@nestjs/common';

import { LocalAuthGuard } from './auth/local/local-auth.guard';
import { AuthService } from './auth/auth.service';
import { UserService } from './models/user/services/user.service';

@Controller()
export class AppController {
    constructor(
        private authService: AuthService,
        private userService: UserService,
    ) {}

    @UseGuards(LocalAuthGuard)
    @Post('login')
    async login(@Request() req) {
        return this.authService.login(req.user);
    }

    @Get('guest')
    async guest() {
        const user = await this.userService.generateGuestUser();
        return this.authService.login(user);
    }
}
