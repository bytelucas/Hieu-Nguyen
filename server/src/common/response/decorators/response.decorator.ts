import { SetMetadata, UseInterceptors, applyDecorators } from '@nestjs/common';
import { ResponseMessagePathMetaKey } from '@common/response/constants/response.constant';
import { ResponseInterceptor } from '@common/response/interceptors/response.interceptor';
import { ResponsePagingInterceptor } from '@common/response/interceptors/response.paging.interceptor';

export function Response(messagePath = 'Success'): MethodDecorator {
  return applyDecorators(
    UseInterceptors(ResponseInterceptor),
    SetMetadata(ResponseMessagePathMetaKey, messagePath),
  );
}

export function ResponsePaging(messagePath = 'Success'): MethodDecorator {
  return applyDecorators(
    UseInterceptors(ResponsePagingInterceptor),
    SetMetadata(ResponseMessagePathMetaKey, messagePath),
  );
}
