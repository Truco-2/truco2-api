import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prima.module';
import { UserService } from './user.service';

@Module({
    providers: [UserService],
    exports: [UserService],
    imports: [PrismaModule],
})
export class UserModule {}
