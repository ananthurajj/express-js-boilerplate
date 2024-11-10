export const resetPasswordWorker = async (to, emailDataFields, emailFieldsToBeResolved) => {
  // you can modify the 'to, emailDataFields' fields from these methods

  const modifiedFields = {
    ...emailDataFields,
    ...emailFieldsToBeResolved,
  };
  return { to, emailDataFields: modifiedFields };
};
