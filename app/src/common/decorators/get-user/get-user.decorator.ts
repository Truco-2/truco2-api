import { ExecutionContext, createParamDecorator } from '@nestjs/common';

export const GetUser = createParamDecorator(
    (data: unknown, ctx: ExecutionContext) => {
        switch (ctx.getType()) {
            case 'ws': {
                return ctx.switchToWs().getClient().user;
            }
            case 'http': {
                return ctx.switchToHttp().getRequest().user;
            }
        }
    },
);
