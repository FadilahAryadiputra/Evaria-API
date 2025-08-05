import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateEventTicketDTO {
  @IsNotEmpty()
  @IsString()
  title!: string;

  @IsNotEmpty()
  @IsNumber()
  price!: number;

  @IsNotEmpty()
  @IsString()
  description!: string;

  @IsNotEmpty()
  @IsNumber()
  limit!: number;

  @IsNotEmpty()
  @IsString()
  eventId!: string;
}
