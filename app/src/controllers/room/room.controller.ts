import { Controller, Get } from '@nestjs/common';

@Controller('room')
export class RoomController {
    @Get('/')
    get(): string {
        return `Hello Rooms`;
    }
}
