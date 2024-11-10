import { AccessMode, appMainSDK } from 'codegen-sdk';
export const pushNotificationWorker = async (sessionId) => {
  const { sdk } = appMainSDK(AccessMode.serviceAdmin, process.env.APP_MAIN_TOKEN);
  const { getOneSession } = await sdk.getOneSession({
    filter: { _id: sessionId, sort: { _id: -1 } },
  });
  const { getOneUser } = await sdk.GetOneUser({
    filter: { _id: getOneSession?.trainerId, sort: { _id: -1 } },
  });
  const specializationId = getOneSession?.specializationId || '';
  const { getSpecializationById } = await sdk.GetSpecializationById({ id: specializationId });

  const notificationDataFields = {
    userName: getOneUser?.displayName,
    scheduleDateTime: getOneSession?.trainerAssignedDateTime,
    recieverId: getOneSession?.traineeId,
    specialization: getSpecializationById?.title,
  };
  return notificationDataFields;
};
