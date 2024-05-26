import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { PrismaService } from './prisma.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './services/users/users.module';
import { UsersService } from './services/users/users.service';

@Module({
    imports: [AuthModule, UsersModule],
    controllers: [AppController],
    providers: [PrismaService, UsersService],
})
export class AppModule {}
