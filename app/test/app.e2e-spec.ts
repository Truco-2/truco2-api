import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from 'src/app.module';
import { AuthService } from 'src/auth/auth.service';
import { UsersService } from 'src/services/users/users.service';

describe('AppController (e2e)', () => {
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
                    provide: UsersService,
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

    it('/login (POST)', () => {
        mockAuthService.login.mockReturnValue({
            acess_token: 'valid_token',
        });

        mockAuthService.validateUser.mockReturnValue({
            id: 1,
            email: '',
            name: '',
        });

        return request(app.getHttpServer())
            .post('/login')
            .send({
                username: 'user',
                password: 'password',
            })
            .expect(201)
            .expect('{"acess_token":"valid_token"}');
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
            .expect(200)
            .expect('{"acess_token":"valid_token"}');
    });
});
