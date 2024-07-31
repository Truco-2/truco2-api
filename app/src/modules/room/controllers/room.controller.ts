import {
    Body,
    Controller,
    Get,
    Post,
    Query,
    UseFilters,
    UseGuards,
    UseInterceptors,
} from '@nestjs/common';

import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt/jwt-auth.guard';
import { FormatResponseInterceptor } from 'src/common/interceptors/format-response/format-response.interceptor';
import { RoomService } from '../services/room.service';
import { RoomGateway } from '../gateways/room.gateway';
import { RoomDto } from '../dtos/room.dto';
import { GetUser } from 'src/common/decorators/get-user/get-user.decorator';
import { HttpExceptionFilter } from 'src/common/filters/http-exception/http-exception.filter';
import { RoomCodeDto } from '../dtos/room-code.dto';

@ApiBearerAuth()
@UseInterceptors(FormatResponseInterceptor)
@Controller('rooms')
export class RoomController {
    constructor(
        private readonly roomService: RoomService,
        private readonly roomGateway: RoomGateway,
    ) {}

    @UseGuards(AuthGuard('jwt'))
    @UseFilters(HttpExceptionFilter)
    @Get('/list')
    async get(): Promise<RoomDto[]> {
        return await this.roomService.listAvailables();
    }

    @UseGuards(JwtAuthGuard)
    @UseFilters(HttpExceptionFilter)
    @Post('/create')
    async create(
        @GetUser() user,
        @Body()
        data: RoomDto,
    ): Promise<RoomDto> {
        const room = await this.roomService.create(user.userId, data);

        this.roomGateway.updateAvailableList(room);

        return room;
    }

    @UseGuards(JwtAuthGuard)
    @UseFilters(HttpExceptionFilter)
    @Post('/enter')
    async enter(
        @GetUser() user,
        @Body() resource: RoomCodeDto,
    ): Promise<RoomDto> {
        const room = await this.roomService.enter(resource, user.userId);

        this.roomGateway.updateAvailableList(room);

        return room;
    }

    @UseGuards(JwtAuthGuard)
    @UseFilters(HttpExceptionFilter)
    @Get('/information')
    async information(@Query() query: RoomCodeDto): Promise<RoomDto> {
        const room = await this.roomService.find(query.code);
        return room;
    }

    @UseGuards(JwtAuthGuard)
    @UseFilters(HttpExceptionFilter)
    @Post('/exit')
    async exit(@GetUser() user): Promise<boolean> {
        const room = await this.roomService.exit(user.userId);

        this.roomGateway.updateAvailableList(room);

        return true;
    }

    @Cron(CronExpression.EVERY_10_SECONDS)
    async HandleRooms() {
        await this.roomService.RemovePlayersFromInactiveRooms();
    }
}
