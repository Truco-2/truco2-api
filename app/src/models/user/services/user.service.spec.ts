import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { PrismaService } from 'src/providers/prisma/prisma.service';
import { UserModule } from '../user.module';

describe('UserService', () => {
    let service: UserService;

    const mockPrismaService = {
        user: {
            findFirst: jest.fn(),
            create: jest.fn(),
        },
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                {
                    provide: PrismaService,
                    useValue: mockPrismaService,
                },
            ],
            imports: [UserModule],
        }).compile();

        service = module.get<UserService>(UserService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('Return valid user', async () => {
        // Arrange
        mockPrismaService.user.findFirst.mockReturnValue({
            name: 'user',
        });

        // Act
        const response = await service.userByName('user');

        // Assert
        expect(response.name).toBe('user');
    });

    it('Generate guest user ok', async () => {
        // Arrange
        mockPrismaService.user.create.mockReturnValue({
            id: 1,
            name: 'user',
        });

        // Act
        const response = await service.generateGuestUser();

        // Assert
        expect(response.name).toBe('user');
    });
});
