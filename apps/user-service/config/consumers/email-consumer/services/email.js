import formData from 'form-data';
import { assign, keys, size } from 'lodash';
import { DateTime } from 'luxon';
import Mailgun from 'mailgun.js';

import { emailConfig } from './email-work-flow-data.config.mjs';

const mailgun = new Mailgun(formData);
const API_KEY = process.env.MAILGUN_API_KEY;
const DOMAIN = process.env.MAILGUN_DOMAIN;
const FROM = process.env.MAILGUN_FROM_EMAIL;

const mailgunClient = mailgun.client({ username: 'api', key: API_KEY });

export const sendEmail = async (queueItem) => {
  try {
    const processedQueueItem = await processTheEmailQueueItem(queueItem);
    console.log(processedQueueItem);
    return mailgunSendMail(processedQueueItem);
  } catch (error) {
    console.log('sendEmail error', error);
    throw error;
  }
};

const processTheEmailQueueItem = async (data) => {
  const event = emailConfig[data.template];
  // if (event.method) {
  //   const { to, emailDataFields } = await event.method(
  //     data.to,
  //     data.emailDataFields
  //   );
  //   data.to = to;
  //   data.emailDataFields = emailDataFields;
  // }
  if (event?.method) {
    const { to, emailDataFields } = await event.method(data.to, data.emailDataFields);
    if (typeof to === 'string' && typeof emailDataFields === 'object') {
      data.to = to;
      data.emailDataFields = emailDataFields;
    } else {
      console.error('Invalid input from event.method');
    }
  }
  const templateFields = keys(data.emailDataFields);
  assign(data.emailDataFields, { projectName: process.env.PROJECT_NAME });
  assign(data.emailDataFields, {
    logoURL: process.env.PROJECT_LOGO_URL,
  });
  assign(data.emailDataFields, {
    infoEmail: process.env.PROJECT_INFO_EMAIL,
  });
  assign(data.emailDataFields, {
    copyRightYear: DateTime.now().toObject().year,
  });
  const temp = event?.subject;
  try {
    for (const field of templateFields) {
      event.subject = event.subject.replace(new RegExp(event.fields[field], 'g'), data.emailDataFields[field]);
    }
    const updatedSubject = event.subject;
    event.subject = temp;
    return {
      subject: updatedSubject,
      to: data.to,
      cc: data.cc || undefined,
      from: FROM,
      template: event.templateName,
      variables: data.variables,
    };
  } catch (err) {
    console.log(JSON.stringify(err));
    throw err;
  }
};

const mailgunSendMail = async (data) => {
  try {
    console.log('Sending mail payload :', data);
    const messageData = {
      from: data.from,
      to: data.to,
      subject: data.subject,
      template: data.template,
    };
    if (data.cc) {
      messageData.cc = data.cc;
    }
    assign(messageData, {
      'h:X-Mailgun-Variables': JSON.stringify({
        projectName: process.env.PROJECT_NAME,
        logoURL: process.env.PROJECT_LOGO_URL,
        infoEmail: process.env.PROJECT_INFO_EMAIL,
        copyRightYear: DateTime.now().toObject().year,
        ...(size(data.variables) ? data.variables : {}),
      }),
    });
    await mailgunClient.messages.create(DOMAIN, messageData);
  } catch (err) {
    console.log(JSON.stringify(err));
    throw err;
  }
};
