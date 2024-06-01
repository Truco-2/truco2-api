import { firstValueFrom, of } from 'rxjs';
import { FormatResponseInterceptor } from './format-response.interceptor';

const executionContext = {
    getClass: jest.fn(),
    getHandler: jest.fn(),
    switchToHttp: jest.fn(),
    getArgByIndex: jest.fn(),
    getArgs: jest.fn(),
    getType: jest.fn(),
    switchToRpc: jest.fn(),
    switchToWs: jest.fn(),
};

const callHandler = {
    handle: () => {
        return of(['test']);
    },
};

describe('FormatResponseInterceptor', () => {
    it('should be defined', () => {
        expect(new FormatResponseInterceptor()).toBeDefined();
    });

    describe('Format Response', () => {
        it('Intercept response and returns it formated', async () => {
            const actualValue = await new FormatResponseInterceptor().intercept(
                executionContext,
                callHandler,
            );

            const res = await firstValueFrom(actualValue);

            expect(res).toStrictEqual({
                success: true,
                data: ['test'],
            });
        });
    });
});
