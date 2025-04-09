import { Transform } from 'class-transformer';
import { IsString, IsNotEmpty, IsDate } from 'class-validator';

export class CreateLogBookDto {
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => value && value.trim())
  log: string;

  @IsDate()
  @IsNotEmpty()
  @Transform(({ value }) => new Date(value))
  date: Date;
}
