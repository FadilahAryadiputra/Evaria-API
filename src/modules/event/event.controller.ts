import { Request, Response } from "express";
import { EventService } from "./event.service";
import { plainToInstance } from "class-transformer";
import { PaginationQueryParams } from "../pagination/dto/pagination.dto";

export class EventController {
  private eventService: EventService

  constructor() {
    this.eventService = new EventService();
  }

  getEvents = async (req: Request, res: Response) => {
    const query = plainToInstance(PaginationQueryParams, req.query);
    const result = await this.eventService.getEvents(query);
    res.status(200).send(result);
  }
}