import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { UserService } from 'src/modules/user/services/user.service';

describe('AuthService', () => {
    let service: AuthService;

    const mockUserService = {
        userByName: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AuthService,
                JwtService,
                {
                    provide: UserService,
                    useValue: mockUserService,
                },
            ],
        }).compile();

        service = module.get<AuthService>(AuthService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('Validate user ok', async () => {
        // Arrange
        mockUserService.userByName.mockReturnValue({
            name: 'admin',
            password: 'password',
        });

        // Act
        const response = await service.validateUser('admin', 'password');
        // Assert
        expect(response.name).toBe('admin');
    });

    it('Validate user not ok', async () => {
        // Arrange
        mockUserService.userByName.mockReturnValue({
            name: 'admin',
            password: 'password',
        });

        // Act
        const response = await service.validateUser('admin', 'wrong_password');

        // Assert
        expect(response).toBe(null);
    });
});
