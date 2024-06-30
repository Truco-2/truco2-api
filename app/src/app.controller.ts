import {
    Controller,
    Request,
    Post,
    UseGuards,
    Get,
    UseInterceptors,
    Body,
    UseFilters,
} from '@nestjs/common';

import { LocalAuthGuard } from './auth/local/local-auth.guard';
import { AuthService } from './auth/auth.service';
import { UserService } from './modules/user/services/user.service';
import { FormatResponseInterceptor } from './common/interceptors/format-response/format-response.interceptor';
import { CreateUserDto } from './modules/user/dtos/create-user.dto';
import { HttpExceptionFilter } from './common/filters/http-exception/http-exception.filter';

@Controller()
export class AppController {
    constructor(
        private authService: AuthService,
        private userService: UserService,
    ) {}

    @UseGuards(LocalAuthGuard)
    @UseInterceptors(FormatResponseInterceptor)
    @Post('login')
    async login(@Request() req) {
        return this.authService.login(req.user);
    }

    @UseInterceptors(FormatResponseInterceptor)
    @UseFilters(HttpExceptionFilter)
    @Post('signin')
    async signin(
        @Body()
        data: CreateUserDto,
    ) {
        return await this.userService.create(data);
    }

    @Get('guest')
    @UseInterceptors(FormatResponseInterceptor)
    async guest() {
        const user = await this.userService.generateGuestUser();
        return this.authService.login(user);
    }
}
