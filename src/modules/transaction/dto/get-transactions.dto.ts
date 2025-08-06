import { IsOptional, IsString } from 'class-validator';
import { PaginationQueryParams } from '../../pagination/dto/pagination.dto';

export class GetTransactionsDTO extends PaginationQueryParams {
  @IsOptional()
  @IsString()
  search?: string;
  startDate?: Date;
  endDate?: Date;
}
