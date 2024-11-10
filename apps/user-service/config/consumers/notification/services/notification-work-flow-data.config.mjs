import { userCreatedHelper } from './method-worker/userCreatedHelper.mjs';
export const notificationConfig = {
  'user-welcome-mail': {
    templateName: 'user-welcome-mail',
    fields: {
      username: '{username}',
    },
    title: 'Welcome {username}',
    message: 'Welcome {username} to express',
    method: userCreatedHelper,
  },
};
