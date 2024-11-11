import { Consumer } from 'sqs-consumer';
import { sqs } from '../../aws/sqs.mjs';
import { notificationHandler } from './services/handler.mjs';
export const notificationConsumer = Consumer.create({
  queueUrl: String(process.env.NOTIFICATION_QUEUE),
  visibilityTimeout: 300,
  batchSize: 3,
  handleMessageBatch: notificationHandler,
  sqs: sqs,
});

notificationConsumer.on('error', (err) => {
  console.error('error from emailConsumer', err.message);
});

notificationConsumer.on('processing_error', (err) => {
  console.error('processing error from emailConsumer', err.message);
});

notificationConsumer.on('timeout_error', (err) => {
  console.error('timeout error from emailConsumer', err.message);
});
