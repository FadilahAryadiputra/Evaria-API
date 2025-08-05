import { IsDateString, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateEventVoucherDTO {
  @IsNotEmpty()
  @IsString()
  code!: string;

  @IsNotEmpty()
  @IsNumber()
  discount!: number;

  @IsNotEmpty()
  @IsNumber()
  quota!: number;

  @IsNotEmpty()
  @IsDateString()
  startDate!: string;

  @IsNotEmpty()
  @IsDateString()
  endDate!: string;

  @IsNotEmpty()
  @IsString()
  eventId!: string;
}
