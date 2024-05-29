import { Module } from '@nestjs/common';
import { UserService } from './services/user.service';
import { PrismaModule } from 'src/providers/prisma/prima.module';

@Module({
    providers: [UserService],
    exports: [UserService],
    imports: [PrismaModule],
})
export class UserModule {}
