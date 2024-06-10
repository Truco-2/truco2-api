import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { PrismaService } from 'src/prisma.service';

describe('UsersService', () => {
    let service: UsersService;

    const mockPrismaService = {
        user: {
            findFirst: jest.fn(),
        },
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                UsersService,
                {
                    provide: PrismaService,
                    useValue: mockPrismaService,
                },
            ],
        }).compile();

        service = module.get<UsersService>(UsersService);
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
});
