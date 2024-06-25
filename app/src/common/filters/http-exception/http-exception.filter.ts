import {
    ArgumentsHost,
    BadRequestException,
    Catch,
    ExceptionFilter,
    HttpException,
    HttpStatus,
    UnauthorizedException,
} from '@nestjs/common';
import { isArray } from 'class-validator';
import { Response } from 'express';

@Catch(BadRequestException, HttpException, Error, UnauthorizedException)
export class HttpExceptionFilter<T> implements ExceptionFilter {
    catch(exception: T, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();

        let statusCode = HttpStatus.BAD_REQUEST;
        const message = [];

        const badReq = exception as BadRequestException;
        const errorReq = exception as Error;

        if (badReq['response']) {
            if (
                badReq['response']['message'] &&
                isArray(badReq['response']['message'])
            ) {
                badReq['response']['message'].forEach((element) => {
                    message.push(element);
                });
            }

            statusCode = badReq['response']['statusCode'] ?? statusCode;
        } else if (errorReq.message) {
            message.push(errorReq.message);
        }

        response.status(statusCode).json({
            success: false,
            message: message,
            status: statusCode,
        });
    }
}
