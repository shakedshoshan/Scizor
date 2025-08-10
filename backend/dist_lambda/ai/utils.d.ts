import { BadRequestException } from '@nestjs/common';
export declare function getContentType(format: string): string;
export declare function serviceErrorHandler(error: any, operationName: string): BadRequestException;
