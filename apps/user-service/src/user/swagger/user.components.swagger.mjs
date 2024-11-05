export const userComponents = {
  User: {
    type: 'object',
    properties: {
      _id: { type: 'string' },
      firstName: { type: 'string' },
      lastName: { type: 'string' },
      displayName: { type: 'string', nullable: true },
      profileImage: { type: 'string', format: 'uri', nullable: true },
      email: { type: 'string' },
      countryCode: { type: 'string' },
      phoneNumber: { type: 'string' },
      phoneNoWithCountryCode: { type: 'string', nullable: true },
      gender: {
        type: 'string',
        enum: ['Male', 'Female', 'Non-Binary'],
        nullable: true,
      },
      status: { type: 'boolean' },
      locationName: { type: 'string', nullable: true },
      locationPoint: {
        type: 'object',
        properties: {
          type: { type: 'string', enum: ['Point'] },
          coordinates: {
            type: 'array',
            items: { type: 'number' },
            minItems: 2,
            maxItems: 2,
          },
        },
        nullable: true,
      },
      timezone: { type: 'string' },
      role: {
        type: 'string',
        enum: ['ADMIN', 'USER'],
      },
      createdById: { type: 'string', nullable: true },
    },
  },
};
