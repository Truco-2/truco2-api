import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { RoomsService } from 'src/services/rooms/rooms.service';

@Module({ providers: [RoomsService, PrismaService] })
export class RoomsModule {}
