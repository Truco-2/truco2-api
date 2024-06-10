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
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth } from '@nestjs/swagger';
import { Room } from '@prisma/client';
import { JwtAuthGuard } from 'src/auth/jwt/jwt-auth.guard';
import { FormatResponseInterceptor } from 'src/common/interceptors/format-response/format-response.interceptor';
import { RoomService } from '../services/room.service';
import { RoomGateway } from '../gateways/room.gateway';
import { RoomResourceDto } from '../dtos/room.dto';
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
    @Get('/')
    async get(): Promise<Room[]> {
        return await this.roomService.listAvailables();
    }

    @UseGuards(JwtAuthGuard)
    @UseFilters(HttpExceptionFilter)
    @Post('/create')
    async create(
        @GetUser() user,
        @Body()
        data: RoomResourceDto,
    ): Promise<Room> {
        const room = await this.roomService.create(user.userId, data);

        await this.roomService.enter(user.userId, room.code);

        this.roomGateway.updateAvailableList(room);

        return room;
    }

    @UseGuards(JwtAuthGuard)
    @UseFilters(HttpExceptionFilter)
    @Post('/enter')
    async enter(@GetUser() user, @Query() query: RoomCodeDto): Promise<Room> {
        const room = await this.roomService.enter(user.userId, query.code);

        this.roomGateway.updateAvailableList(room);

        return room;
    }
}
