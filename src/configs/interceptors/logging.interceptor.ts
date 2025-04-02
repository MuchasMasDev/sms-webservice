import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const method = request.method;
    const url = request.url;
    const handler = context.getHandler().name;

    this.logger.log(
      `Handling ${method} request to ${url} (Handler: ${handler})`,
    );

    return next.handle().pipe(
      tap({
        next: () => this.logger.log(`Handled ${method} request to ${url}`),
        error: () =>
          this.logger.error(`Error handling ${method} request to ${url}`),
      }),
    );
  }
}
