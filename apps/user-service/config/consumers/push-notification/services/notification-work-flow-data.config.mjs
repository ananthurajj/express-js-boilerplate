import { pushNotificationWorker } from './method-worker/trainer-assigned.helper.mjs';
export const notificationConfig = {
  trainerAssigned: {
    templateName: 'user-welcome-mail',
    fields: {
      userName: '{userName}', //trainerName: "{trainerName}",
      scheduleDateTime: '{scheduleDateTime}',
      specialization: '{specialization}',
    },
    subject: 'Trainer Assigned For Session Requested For - {scheduleDateTime}',
    description:
      '{userName} Assigned For Your Sesssion Specializing on {specialization},Please Join On {scheduleDateTime}',
    icon: null,
    method: pushNotificationWorker,
  },
};
