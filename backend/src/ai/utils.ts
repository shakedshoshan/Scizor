import { BadRequestException, ServiceUnavailableException } from '@nestjs/common';

export function getContentType(format: string): string {
    const contentTypes = {
      'mp3': 'audio/mpeg',
      'opus': 'audio/opus',
      'aac': 'audio/aac',
      'flac': 'audio/flac',
    };
    
    return contentTypes[format] || 'audio/mpeg';
  }

/**
 * Centralized error handler for AI service operations
 * @param error - The error object to handle
 * @param operationName - Name of the operation that failed (e.g., 'enhance prompt', 'generate response')
 * @returns BadRequestException with user-friendly message
 */
export function serviceErrorHandler(error: any, operationName: string): BadRequestException {
  // Re-throw BadRequestException as is (these are our custom user-friendly errors)
  if (error instanceof BadRequestException) {
    throw error;
  }

  // Handle ServiceUnavailableException
  if (error instanceof ServiceUnavailableException) {
    throw new BadRequestException('AI service is currently unavailable. Please try again later.');
  }

  // Handle OpenAI API errors
  if (error?.response?.status) {
    switch (error.response.status) {
      case 401:
        throw new BadRequestException('AI service authentication failed. Please contact support.');
      case 429:
        throw new BadRequestException('AI service is experiencing high demand. Please try again in a few minutes.');
      case 400:
        throw new BadRequestException(`Invalid request parameters for ${operationName}. Please check your input and try again.`);
      case 500:
        throw new BadRequestException('AI service encountered an internal error. Please try again later.');
      default:
        throw new BadRequestException(`AI service error occurred during ${operationName}. Please try again later.`);
    }
  }

  // Handle network or connection errors
  if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
    throw new BadRequestException('Unable to connect to AI service. Please check your internet connection and try again.');
  }

  // Handle timeout errors
  if (error.code === 'ETIMEDOUT' || error.message?.includes('timeout')) {
    throw new BadRequestException('AI service request timed out. Please try again.');
  }

  // Generic error fallback
  throw new BadRequestException(`Failed to ${operationName}. Please try again later.`);
}