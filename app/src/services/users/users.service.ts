import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class UsersService {
    constructor(private prisma: PrismaService) {}

    async userByName(username: string): Promise<User | null> {
        return this.prisma.user.findFirst({
            where: { name: username },
        });
    }
}
