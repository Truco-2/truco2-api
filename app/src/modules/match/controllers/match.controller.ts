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

@ApiBearerAuth()
@UseInterceptors(FormatResponseInterceptor)
@Controller('match')
export class MatchController {
    constructor(private readonly matchService: MatchService) {}

    @UseGuards(JwtAuthGuard)
    @UseFilters(HttpExceptionFilter)
    @Post('/create')
    async create(
        @Body()
        data: CreateMatchDto,
    ): Promise<any> {
        const match = await this.matchService.create(data.roomCode);

        return match;
    }
}
