import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { UserModule } from 'src/services/user/user.module';
import { AuthService } from './auth.service';
import { jwtConstants } from './constants';
import { LocalStrategy } from './local/local.strategy';
import { JwtStrategy } from './jwt/jwt.strategy';

@Module({
    providers: [AuthService, LocalStrategy, JwtStrategy],
    exports: [AuthService],
    imports: [
        UserModule,
        PassportModule,
        JwtModule.register({
            secret: jwtConstants.secret,
            signOptions: { expiresIn: '8h' },
        }),
    ],
})
export class AuthModule {}
