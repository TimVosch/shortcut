import { IsNotEmpty, IsOptional, IsString, IsUrl } from 'class-validator';

export class CreateShortcutRequest {
  @IsOptional()
  @IsString()
  name?: string;

  @IsUrl()
  @IsNotEmpty()
  destination: string;
}
