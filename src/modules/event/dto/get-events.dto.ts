import { IsOptional, IsString } from 'class-validator';
import { PaginationQueryParams } from '../../pagination/dto/pagination.dto';
import { EventCategory, EventLocation } from '../../../generated/prisma';

export class GetEventsDTO extends PaginationQueryParams {
  @IsOptional()
  @IsString()
  search?: string;
  startDate?: Date;
  endDate?: Date;
  location?: EventLocation;
  category?: EventCategory;
}
