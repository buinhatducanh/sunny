// apps/api/src/auth/auth.dto.ts

import { IsEmail, IsString, MinLength, MaxLength, Matches } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class RegisterDto {
  @ApiProperty({ example: "user@sunny-game.vn" })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: "SunnyPlayer" })
  @IsString()
  @MinLength(3)
  @MaxLength(20)
  @Matches(/^[a-zA-Z0-9_]+$/, {
    message: "Username can only contain letters, numbers, and underscores",
  })
  username!: string;

  @ApiProperty({ example: "SecurePass123!" })
  @IsString()
  @MinLength(8)
  @MaxLength(100)
  password!: string;
}

export class LoginDto {
  @ApiProperty({ example: "user@sunny-game.vn" })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: "SecurePass123!" })
  @IsString()
  password!: string;
}

export class RefreshDto {
  @ApiProperty()
  @IsString()
  refreshToken!: string;
}
