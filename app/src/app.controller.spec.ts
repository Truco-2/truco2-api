import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AuthService } from './auth/auth.service';
import { UserService } from './models/user/services/user.service';

describe('AppController', () => {
    let appController: AppController;

    beforeEach(async () => {
        const app: TestingModule = await Test.createTestingModule({
            controllers: [AppController],
            providers: [
                {
                    provide: AuthService,
                    useValue: {
                        login: (user: { id: number; name: string }) => {
                            return {
                                access_token: `token_${user.name}`,
                            };
                        },
                    },
                },
                {
                    provide: UserService,
                    useValue: {
                        generateGuestUser: () => {
                            return {
                                id: 1,
                                name: 'guest',
                            };
                        },
                    },
                },
            ],
        }).compile();

        appController = app.get<AppController>(AppController);
    });

    describe('Login - Get token by user', () => {
        it('Should login', async () => {
            expect(
                await appController.login({
                    user: {
                        id: 1,
                        name: 'TestUser',
                    },
                }),
            ).toStrictEqual({ access_token: 'token_TestUser' });
        });
    });

    describe('Guest - Login as guest', () => {
        it('Should create a guest', async () => {
            expect(await appController.guest()).toStrictEqual({
                access_token: 'token_guest',
            });
        });
    });
});
