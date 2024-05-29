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
import { ApiBearerAuth } from '@nestjs/swagger';
import { Room } from '@prisma/client';
import { JwtAuthGuard } from 'src/auth/jwt/jwt-auth.guard';
import { FormatResponseInterceptor } from 'src/common/interceptors/format-response/format-response.interceptor';
import { RoomGateway } from 'src/gateways/room/room.gateway';
import { RoomService } from 'src/services/room/room.service';
import { RoomResourceDto } from 'src/types/room.dto';

@ApiBearerAuth()
@UseInterceptors(FormatResponseInterceptor)
@Controller('rooms')
export class RoomsController {
    constructor(
        private RoomService: RoomService,
        private readonly roomGateway: RoomGateway,
    ) {}

    @UseGuards(AuthGuard('jwt'))
    @Get('/')
    async get(): Promise<Room[]> {
        return await this.RoomService.listAvailables();
    }

    @UseGuards(JwtAuthGuard)
    @Post('/create')
    async create(
        @Body()
        data: RoomResourceDto,
    ): Promise<Room> {
        const room = await this.RoomService.create(data);

        this.roomGateway.updateAvailableList(room);

        return room;
    }

    @UseGuards(JwtAuthGuard)
    @Post('/enter')
    async enter(@Query('code') code: string): Promise<Room> {
        return await this.RoomService.enter(code);
    }
}
