import { SQSClient, SendMessageCommand } from '@aws-sdk/client-sqs';

export const sqs = new SQSClient({
  region: process.env.AWS_SQS_REGION,
  endpoint: process.env.AWS_SQS_ENDPOINT,
  credentials: {
    accessKeyId: process.env.AWS_SQS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SQS_SECRET_KEY,
  },
});

export async function SQSHandler(input) {
  const command = new SendMessageCommand(input);
  return sqs.send(command);
}
