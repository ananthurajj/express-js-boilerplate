import _ from 'lodash';
import Twilio from 'twilio';
const { some } = _;

const RATE_LIMIT_UNIQUE_NAME = 'project_rate_limiter';

export async function TwilioConnect() {
  try {
    const client = Twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    const rateLimitExist = await client.verify.v2.services(process.env.TWILIO_SERVICE_SID).rateLimits.list();

    if (!some(rateLimitExist, { uniqueName: RATE_LIMIT_UNIQUE_NAME })) {
      const newRateLimiter = await client.verify.v2.services(process.env.TWILIO_SERVICE_SID).rateLimits.create({
        description: 'Limit on end user phone number',
        uniqueName: RATE_LIMIT_UNIQUE_NAME,
      });
      console.log('New rate limiter created:', newRateLimiter);

      const bucket = await client.verify.v2
        .services(process.env.TWILIO_SERVICE_SID)
        .rateLimits(newRateLimiter.sid)
        .buckets.create({ max: 1, interval: 60 });
      console.log('Bucket created:', bucket);
    } else {
      console.log('Rate Limit already exists');
    }
  } catch (err) {
    console.log(err.message);
  }
}

export function TwilioClient() {
  const client = Twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
  return client.verify.v2.services(process.env.TWILIO_SERVICE_SID);
}
