import {
    ArgumentsHost,
    BadRequestException,
    Catch,
    ExceptionFilter,
    HttpException,
} from '@nestjs/common';
import { Response } from 'express';

@Catch(BadRequestException, HttpException)
export class HttpExceptionFilter<T> implements ExceptionFilter {
    catch(exception: T, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();

        let statusCode = 400;
        const message = [];

        const badReq = exception as BadRequestException;

        if (badReq['response']) {
            if (badReq['response']['message']) {
                badReq['response']['message'].forEach((element) => {
                    message.push(element);
                });
            }

            statusCode = badReq['response']['statusCode'] ?? statusCode;
        }

        response.status(400).json({
            success: false,
            message: message,
            status: statusCode,
        });
    }
}
