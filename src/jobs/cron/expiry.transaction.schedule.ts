import cron from 'node-cron';
import { expiryTransactionJob } from './expiry.transaction.job';

export const expiryTransactionSchedul = () => {
  console.log("Starting...");
  const job = new expiryTransactionJob();

  cron.schedule('* * * * *', async () => {
    console.log('[⌚ CRON] Executed...');
    await job.expiryTransactionSchedul();
  });
};