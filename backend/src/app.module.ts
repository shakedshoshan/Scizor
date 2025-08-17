import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { validationSchema } from './config/validation.schema';
import { AiModule } from './ai/ai.module';
import { AuthModule } from './auth/auth.module';
import { PaymentModule } from './payment/payment.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema,
    }),
    AiModule, // AI Module - Handles AI-related functionality
    AuthModule, // Auth Module - Handles authentication and Firestore operations
    PaymentModule, // Payment Module - Handles payment and subscription operations
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
