import { Request, Response } from 'express';
import { EventVoucherService } from './event.voucher.service';

export class EventVoucherController {
  private eventVoucherService: EventVoucherService;

  constructor() {
    this.eventVoucherService = new EventVoucherService();
  }

  createEventVoucher = async (req: Request, res: Response) => {
    const authUser = res.locals.user;
    const result = await this.eventVoucherService.createEventVoucher(req.body, authUser);
    res.status(200).send(result);
  };
}
