import { Consumer } from 'sqs-consumer';
import { sqs } from '../../aws/sqs.mjs';
import { emailHandler } from './services/handler';

export const emailConsumer = Consumer.create({
  queueUrl: String(process.env.EMAIL_QUEUE),
  visibilityTimeout: 300,
  batchSize: 3,
  handleMessageBatch: emailHandler,
  sqs: sqs,
});

emailConsumer.on('error', (err) => {
  console.error('error from emailConsumer', err.message);
});

emailConsumer.on('processing_error', (err) => {
  console.error('processing error from emailConsumer', err.message);
});

emailConsumer.on('timeout_error', (err) => {
  console.error('timeout error from emailConsumer', err.message);
});
