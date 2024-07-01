import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { PrismaService } from 'src/providers/prisma/prisma.service';
import { CreateUserDto } from '../dtos/create-user.dto';
import { faker } from '@faker-js/faker';

@Injectable()
export class UserService {
    constructor(private prisma: PrismaService) {}

    async userByName(username: string): Promise<User | null> {
        return this.prisma.user.findFirst({
            where: { name: username },
        });
    }

    async userByEmail(email: string): Promise<User> {
        return this.prisma.user.findFirst({
            where: { email: email },
        });
    }

    async generateGuestUser(): Promise<User> {
        return this.prisma.user.create({
            data: {
                name:
                    'Guest_' +
                    faker.string.numeric({
                        length: 6,
                    }),
            },
        });
    }

    async create(data: CreateUserDto): Promise<User> {
        const verifyUserExist = await this.prisma.user.findFirst({
            where: {
                OR: [
                    {
                        name: data.name,
                    },
                    {
                        email: data.email,
                    },
                ],
            },
        });

        if (verifyUserExist) {
            throw new Error('User already exists');
        }

        return this.prisma.user.create({
            data: {
                name: data.name,
                email: data.email,
                password: data.password,
            },
        });
    }
}
