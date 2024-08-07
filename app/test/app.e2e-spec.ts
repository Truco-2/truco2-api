import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from 'src/app.module';
import { AuthService } from 'src/auth/auth.service';
import { UserService } from 'src/modules/user/services/user.service';

describe('AppController (e2e)', () => {
    jest.useFakeTimers();
    let app: INestApplication;

    const mockAuthService = {
        login: jest.fn(),
        validateUser: jest.fn(),
    };

    const mockUserService = {
        generateGuestUser: jest.fn(),
    };

    beforeEach(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
            providers: [
                {
                    provide: AuthService,
                    useValue: mockAuthService,
                },
                {
                    provide: UserService,
                    useValue: mockUserService,
                },
            ],
        })
            .overrideProvider(AuthService)
            .useValue(mockAuthService)
            .compile();

        app = moduleFixture.createNestApplication();
        await app.init();
    });

    it('/guest (GET)', () => {
        const user = {
            id: 1,
            email: '',
            name: '',
        };

        mockUserService.generateGuestUser.mockReturnValue(user);
        mockAuthService.validateUser.mockReturnValue(user);
        mockAuthService.login.mockReturnValue({
            acess_token: 'valid_token',
        });

        return request(app.getHttpServer())
            .get('/guest')
            .expect(HttpStatus.OK)
            .expect('{"success":true,"data":{"acess_token":"valid_token"}}');
    });
});
