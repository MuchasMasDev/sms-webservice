import {
  Catch,
  ArgumentsHost,
  ExceptionFilter,
  HttpException,
  Logger,
} from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import * as fs from 'fs';
import { PrismaError } from '../prisma/dto/error-catalog';

@Catch()
export class AllExceptionsFilter
  extends BaseExceptionFilter
  implements ExceptionFilter
{
  private readonly logger = new Logger(AllExceptionsFilter.name);
  private readonly logFilePath = process.env.EXCEPTION_LOG;

  catch(exception: unknown, host: ArgumentsHost) {
    if (this.isPrismaException(exception))
      this.handlePrismaException(exception, host);
    else super.catch(exception, host);

    this.logException(exception, host);
  }

  private isPrismaException(exception: unknown): boolean {
    return (
      typeof exception === 'object' &&
      exception !== null &&
      'code' in exception &&
      typeof (exception as any).code === 'string' &&
      (exception as any).code.startsWith('P')
    );
  }

  private getLogObject(host: ArgumentsHost): {
    method: string;
    url: string;
    body: ReadableStream<Uint8Array> | null;
  } {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();

    return {
      method: request.method,
      url: request.url,
      body: request.body ? request.body : null,
    };
  }

  private handlePrismaException(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const logger = new Logger('PrismaExceptionFilter');

    let status: number = 400;
    let message: string = 'Bad Request';

    // DEBUG
    // console.log(exception);

    const logObject = this.getLogObject(host);
    if (logObject.method !== 'GET')
      logger.error(`Request Details: ${JSON.stringify(logObject, null, 2)}`);

    switch (exception.code) {
      case PrismaError.UniqueConstraintFailed:
        message = `Unique constraint failed on the field(s): ${exception.meta.target}`;
        break;
      case PrismaError.ForeignKeyConstraintFailed:
        message = `Constraint failed on the field(s): ${exception.meta.field_name}`;
        break;
      case PrismaError.ConstraintFailed:
        message = `Constraint failed`;
        break;
      case PrismaError.ValueTooLong:
        message = `Value too long for column type`;
        break;
      case PrismaError.RequiredRelationViolation:
        message = `Required relation violation`;
        break;
      case PrismaError.RecordNotFound:
        status = 404;
        message = exception.meta.modelName
          ? `Record not found in model: ${exception.meta.modelName}`
          : 'Record not found';
        break;
      default:
        status = 500;
        message = 'Database error';
        break;
    }

    response.status(status).json({
      statusCode: status,
      message,
      // error:
      //   status !== 500 ? exception.meta || 'Unknown error' : 'Unknown error',
    });
  }

  private logException(exception: unknown, host: ArgumentsHost) {
    const logObject = this.getLogObject(host);

    const logMessage: string = `${new Date().toISOString()} - ${logObject.method} ${logObject.url} - ${
      logObject.method !== 'GET'
        ? `Body: ${JSON.stringify(logObject.body)}`
        : 'No body to log'
    } - ${exception instanceof HttpException ? exception.message : 'Unknown error'}\n`;

    if (this.logFilePath) {
      fs.appendFile(this.logFilePath, logMessage, (err) => {
        if (err) {
          this.logger.error('Failed to write exception to log file:', err);
        }
      });
    }
  }
}
