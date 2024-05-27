import { Controller, Request, Post, UseGuards, Get } from '@nestjs/common';

import { LocalAuthGuard } from './auth/local/local-auth.guard';
import { JwtAuthGuard } from './auth/jwt/jwt-auth.guard';
import { AuthService } from './auth/auth.service';

@Controller()
export class AppController {
    constructor(private authService: AuthService) { }

    @UseGuards(LocalAuthGuard)
    @Post('login')
    async login(@Request() req) {
        return this.authService.login(req.user);
    }
    //@UseGuards(JwtAuthGuard)

}
