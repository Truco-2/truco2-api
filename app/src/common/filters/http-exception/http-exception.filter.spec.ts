import { BadRequestException, HttpStatus } from '@nestjs/common';
import { HttpExceptionFilter } from './http-exception.filter';

const mockJson = jest.fn();

const mockArgumentsHost = {
    switchToHttp: jest.fn().mockImplementation(() => ({
        getResponse: jest.fn().mockImplementation(() => ({
            status: jest.fn().mockImplementation(() => ({
                json: mockJson,
            })),
        })),
        getRequest: jest.fn(),
    })),
    getArgByIndex: jest.fn(),
    getArgs: jest.fn(),
    getType: jest.fn(),
    switchToRpc: jest.fn(),
    switchToWs: jest.fn(),
};

describe('HttpExceptionFilter', () => {
    it('should be defined', () => {
        expect(new HttpExceptionFilter()).toBeDefined();
    });

    describe('Catch BadRequestException', () => {
        it('Return exception messages and status code, with success equals to false', async () => {
            new HttpExceptionFilter().catch(
                new BadRequestException({
                    message: [
                        'BadRequestException error 1',
                        'BadRequestException error 2',
                    ],
                }),
                mockArgumentsHost,
            );

            expect(mockJson).toHaveBeenCalledWith({
                success: false,
                message: [
                    'BadRequestException error 1',
                    'BadRequestException error 2',
                ],
                status: HttpStatus.BAD_REQUEST,
            });
        });
    });

    describe('Catch Error', () => {
        it('Return exception messages and status code, with success equals to false', async () => {
            new HttpExceptionFilter().catch(
                new Error('Erro excpetion'),
                mockArgumentsHost,
            );

            expect(mockJson).toHaveBeenCalledWith({
                success: false,
                message: ['Erro excpetion'],
                status: HttpStatus.BAD_REQUEST,
            });
        });
    });
});
