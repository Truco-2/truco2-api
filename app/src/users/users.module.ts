import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prima.module';
import { UsersService } from './users.service';

@Module({
    providers: [UsersService],
    exports: [UsersService],
    imports: [PrismaModule],
})
export class UsersModule {}
