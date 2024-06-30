import {
    Controller,
    Post,
    Get,
    UseInterceptors,
    Body,
    UseFilters,
    UnauthorizedException,
} from '@nestjs/common';

import { AuthService } from './auth/auth.service';
import { UserService } from './modules/user/services/user.service';
import { FormatResponseInterceptor } from './common/interceptors/format-response/format-response.interceptor';
import { CreateUserDto } from './modules/user/dtos/create-user.dto';
import { HttpExceptionFilter } from './common/filters/http-exception/http-exception.filter';
import { LoginDto } from './modules/user/dtos/login.dto';

@Controller()
export class AppController {
    constructor(
        private authService: AuthService,
        private userService: UserService,
    ) {}

    @Post('login')
    @UseFilters(HttpExceptionFilter)
    @UseInterceptors(FormatResponseInterceptor)
    async login(
        @Body()
        data: LoginDto,
    ) {
        const user = await this.authService.validateUserByEmail(
            data.email,
            data.password,
        );

        if (!user) {
            throw new UnauthorizedException('User invalid');
        }

        return this.authService.login(user);
    }

    @Post('signin')
    @UseInterceptors(FormatResponseInterceptor)
    @UseFilters(HttpExceptionFilter)
    async signin(
        @Body()
        data: CreateUserDto,
    ) {
        const user = await this.userService.create(data);
        return user;
    }

    @Get('guest')
    @UseInterceptors(FormatResponseInterceptor)
    @UseFilters(HttpExceptionFilter)
    async guest() {
        const user = await this.userService.generateGuestUser();
        return this.authService.login(user);
    }
}
