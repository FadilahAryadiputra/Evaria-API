import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateTransactionDTO {
  @IsNotEmpty()
  @IsNumber()
  quantity!: number;

  @IsNumber()
  pointUsed?: number;

  @IsNotEmpty()
  @IsString()
  eventTicketId!: string;
  
  @IsOptional()
  @IsString()
  voucherCode?: string;
}
