import { Router } from 'express';
import { JwtMiddleware } from '../../middlewares/jwt.middleware';
import { validateBody } from '../../middlewares/validate.middleware';
import { TransactionController } from './transaction.controller';
import { CreateTransactionDTO } from './dto/create-transaction.dto';
import { UploaderMiddleware } from '../../middlewares/uploader.middleware';

export class TransactionRouter {
  private router: Router;
  private transactionController: TransactionController;
  private uploaderMiddleware: UploaderMiddleware;
  private jwtMiddleware: JwtMiddleware;

  constructor() {
    this.router = Router();
    this.transactionController = new TransactionController();
    this.uploaderMiddleware = new UploaderMiddleware();
    this.jwtMiddleware = new JwtMiddleware();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.get('/', 
      this.jwtMiddleware.verifyToken(process.env.JWT_SECRET_KEY!),
      this.transactionController.getTransactionsByUser
    );
    this.router.post(
      '/create-transaction',
      this.jwtMiddleware.verifyToken(process.env.JWT_SECRET_KEY!),
      validateBody(CreateTransactionDTO),
      this.transactionController.createTransaction
    );
    this.router.get(
      '/:id',
      // this.jwtMiddleware.verifyToken(process.env.JWT_SECRET_KEY!),
      this.transactionController.getTransactionById
    )
    this.router.patch(
      '/:id/pay-transaction',
      this.jwtMiddleware.verifyToken(process.env.JWT_SECRET_KEY!),
      this.transactionController.payTransaction
    )
    this.router.post(
      '/upload-payment-proof',
      this.jwtMiddleware.verifyToken(process.env.JWT_SECRET_KEY!),
      this.uploaderMiddleware
        .upload()
        .fields([{ name: 'file', maxCount: 1 }]),
      this.transactionController.uploadPaymentProof
    );
    this.router.get(
      '/get-pending-transactions',
      this.jwtMiddleware.verifyToken(process.env.JWT_SECRET_KEY!),
      this.transactionController.getPendingTransactionByOrganizer
    );
    this.router.patch(
      '/:id/accept-transaction',
      this.jwtMiddleware.verifyToken(process.env.JWT_SECRET_KEY!),
      this.transactionController.acceptTransaction
    )
  }

  getRouter = () => {
    return this.router;
  };
}
