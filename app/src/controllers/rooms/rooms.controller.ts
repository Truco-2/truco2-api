import {
    Body,
    Controller,
    Get,
    Post,
    Query,
    UseGuards,
    UseInterceptors,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Room } from '@prisma/client';
import { JwtAuthGuard } from 'src/auth/jwt/jwt-auth.guard';
import { FormatResponseInterceptor } from 'src/common/interceptors/format-response/format-response.interceptor';
import { RoomsService } from 'src/services/rooms/rooms.service';
import { IRoomResource } from 'src/types/rooms';

@UseInterceptors(FormatResponseInterceptor)
@Controller('rooms')
export class RoomsController {
    constructor(private roomsService: RoomsService) {}

    @UseGuards(AuthGuard('jwt'))
    @Get('/')
    async get(): Promise<Room[]> {
        return await this.roomsService.listAvailables();
    }

    @UseGuards(JwtAuthGuard)
    @Post('/create')
    async create(
        @Body()
        data: IRoomResource,
    ): Promise<Room> {
        return await this.roomsService.create(data);
    }

    @UseGuards(JwtAuthGuard)
    @Post('/enter')
    async enter(@Query('code') code: string): Promise<Room> {
        return await this.roomsService.enter(code);
    }
}
