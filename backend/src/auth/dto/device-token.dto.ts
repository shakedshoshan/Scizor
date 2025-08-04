import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class DeviceTokenExchangeDto {
  @IsString()
  @IsOptional()
  authorization_code?: string;

  @IsString()
  @IsOptional()
  consent_token?: string;

  @IsString()
  @IsNotEmpty()
  code_verifier: string;

  @IsString()
  @IsNotEmpty()
  redirect_uri: string;
}

export class DeviceTokenRefreshDto {
  @IsString()
  @IsNotEmpty()
  refresh_token: string;
}

export class DeviceTokenResponseDto {
  @IsString()
  @IsNotEmpty()
  access_token: string;

  @IsString()
  @IsNotEmpty()
  refresh_token: string;

  @IsString()
  @IsNotEmpty()
  user_id: string;

  @IsString()
  @IsNotEmpty()
  expires_in: number;

  @IsString()
  @IsOptional()
  token_type?: string = 'Bearer';
} 