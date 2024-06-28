import {
    Body,
    Controller,
    Post,
    UseFilters,
    UseGuards,
    UseInterceptors,
} from '@nestjs/common';
import { MatchService } from '../services/match.service';
import { JwtAuthGuard } from 'src/auth/jwt/jwt-auth.guard';
import { HttpExceptionFilter } from 'src/common/filters/http-exception/http-exception.filter';
import { CreateMatchDto } from '../dtos/create-match.dto';
import { ApiBearerAuth } from '@nestjs/swagger';
import { FormatResponseInterceptor } from 'src/common/interceptors/format-response/format-response.interceptor';
import { RoomGateway } from 'src/modules/room/gateways/room.gateway';
import { RoomService } from 'src/modules/room/services/room.service';
import { MatchGateway } from '../gateways/match.gateway';
import { RoomStatus } from 'src/common/enums/room-status.enum';

@ApiBearerAuth()
@UseInterceptors(FormatResponseInterceptor)
@Controller('match')
export class MatchController {
    constructor(
        private readonly matchService: MatchService,
        private readonly matchGateway: MatchGateway,
        private readonly roomGateway: RoomGateway,
        private readonly roomService: RoomService,
    ) {}

    @UseGuards(JwtAuthGuard)
    @UseFilters(HttpExceptionFilter)
    @Post('/create')
    async create(
        @Body()
        data: CreateMatchDto,
    ): Promise<any> {
        const match = await this.matchService.create(data.roomCode);

        const room = await this.roomService.updateStatus(
            data.roomCode,
            RoomStatus.STARTED,
        );

        this.roomGateway.updateAvailableList(room);

        this.roomGateway.startMatch(room, match);

        this.matchGateway.sendStartTimer(match);

        return match;
    }
}
