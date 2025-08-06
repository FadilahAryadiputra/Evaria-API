import { Request, Response } from 'express';
import { TransactionService } from './transaction.service';
import { ApiError } from '../../utils/api-error';
import { plainToInstance } from 'class-transformer';
import { PaginationQueryParams } from '../pagination/dto/pagination.dto';

export class TransactionController {
  private transactionService: TransactionService;

  constructor() {
    this.transactionService = new TransactionService();
  }

  getTransactionsByUser = async (req: Request, res: Response) => {
    const authUser = res.locals.user;
    const query = plainToInstance(PaginationQueryParams, req.query);
    const result = await this.transactionService.getTransactionsByUser(query, authUser);
    res.status(200).send(result);
  };

  createTransaction = async (req: Request, res: Response) => {
    const authUser = res.locals.user;
    const result = await this.transactionService.createTransaction(
      req.body,
      authUser
    );
    res.status(200).send(result);
  };

  getTransactionById = async (req: Request, res: Response) => {
    const { id: transactionId } = req.params;
    const result =
      await this.transactionService.getTransactionById(transactionId);
    res.status(200).send(result);
  };

  payTransaction = async (req: Request, res: Response) => {
    const { id: transactionId } = req.params;
    const result = await this.transactionService.payTransaction(transactionId);
    res.status(200).send(result);
  };

  uploadPaymentProof = async (req: Request, res: Response) => {
    const authUser = res.locals.user;
    const { transactionId } = req.body;
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    const file = files?.file?.[0];

    if (!file) throw new ApiError('file is required', 400);
    if (!transactionId) throw new ApiError('transactionId is required', 400);

    const result = await this.transactionService.uploadPaymentProof(
      transactionId,
      authUser,
      file
    );

    res.status(200).send(result);
  };

  getPendingTransactionByOrganizer = async (req: Request, res: Response) => {
    const authUser = res.locals.user;
    const result =
      await this.transactionService.getPendingTransactionsByOrganizer(authUser);
    res.status(200).send(result);
  };

  acceptTransaction = async (req: Request, res: Response) => {
    const { id: transactionId } = req.params;
    const result =
      await this.transactionService.acceptTransaction(transactionId);
    res.status(200).send(result);
  };
}
