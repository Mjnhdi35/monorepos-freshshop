import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class RefreshTokenSessionDto {
  @ApiProperty({
    description: 'Refresh token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  @IsString()
  @IsNotEmpty()
  refresh_token: string;

  @ApiProperty({
    description: 'Session ID (optional, for session-based refresh tokens)',
    example: 'session_123456789',
    required: false,
  })
  @IsOptional()
  @IsString()
  session_id?: string;
}
