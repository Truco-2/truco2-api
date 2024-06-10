import { Module } from '@nestjs/common';
import { UserService } from './services/user.service';
import { PrismaService } from 'src/prisma.service';

@Module({
    providers: [UserService, PrismaService],
    exports: [UserService],
})
export class UserModule {}
