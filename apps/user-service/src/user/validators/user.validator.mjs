import Joi from 'joi';
import mongoose from 'mongoose';
import { Gender } from '../models/user.model.mjs';

const idSchema = Joi.string()
  .custom((value, helpers) => {
    if (!mongoose.Types.ObjectId.isValid(value)) {
      return helpers.message('Invalid user ID format; must be a valid MongoDB ObjectId');
    }
    return value;
  })
  .required()
  .messages({
    'any.required': 'User ID is required',
    'string.base': 'User ID must be a string',
  });

export const validateId = (req, res, next) => {
  const { error } = idSchema.validate(req.params.id);
  if (error) return res.status(400).json({ error: error.message });
  next();
};

const phoneRegex = /^[0-9+]{5,25}$/;
const countryCodeRegex = /^[0-9+]{1,6}$/;

export const validateCreateUser = Joi.object({
  firstName: Joi.string().trim().lowercase().required().messages({
    'string.empty': 'First name is required',
  }),
  lastName: Joi.string().trim().lowercase().optional().allow(null),
  profileImage: Joi.string().trim().uri().optional().allow(null),
  email: Joi.string().email().trim().lowercase().required().messages({
    'string.email': 'A valid email address is required',
    'string.empty': 'Email is required',
  }),
  countryCode: Joi.string().pattern(countryCodeRegex).trim().required().messages({
    'string.pattern.base': 'Country code should be 1 to 6 digits',
    'string.empty': 'Country code is required',
  }),
  phoneNumber: Joi.string().pattern(phoneRegex).trim().required().messages({
    'string.pattern.base': 'Phone number should be 5 to 25 digits',
    'string.empty': 'Phone number is required',
  }),
  gender: Joi.string()
    .valid(...Object.values(Gender))
    .optional()
    .messages({
      'any.only': 'Gender must be either Male, Female, or Non-Binary',
    }),
  status: Joi.boolean().optional().default(true),
  password: Joi.string().min(8).trim().optional().messages({
    'string.min': 'Password must be at least 8 characters long',
  }),
  locationName: Joi.string().trim().optional().allow(null),
  locationPoint: Joi.object({
    type: Joi.string().valid('Point').default('Point'),
    coordinates: Joi.array().items(Joi.number()).length(2).default([0, 0]),
  })
    .optional()
    .allow(null),
  timezone: Joi.string().trim().default('Asia/Kolkata').optional(),
  role: Joi.string().valid('ADMIN', 'USER').trim().default('USER').optional(),
});

export const adminValidateCreateUser = Joi.object({
  status: Joi.boolean().optional().default(true),
  role: Joi.string().valid('ADMIN', 'USER').trim().default('USER').optional(),
}).unknown(true);

export const adminUpdateUserSchema = Joi.object({
  firstName: Joi.string().trim().lowercase().optional(),
  lastName: Joi.string().trim().lowercase().optional().allow(null),
  displayName: Joi.string().trim().optional().allow(null),
  profileImage: Joi.string().trim().uri().optional().allow(null),
  email: Joi.string().email().trim().lowercase().optional(),
  countryCode: Joi.string().pattern(countryCodeRegex).trim().optional(),
  phoneNumber: Joi.string().pattern(phoneRegex).trim().optional(),
  phoneNoWithCountryCode: Joi.string().pattern(phoneRegex).trim().optional().allow(null),
  gender: Joi.string()
    .valid(...Object.values(Gender))
    .optional(),
  status: Joi.boolean().optional(),
  password: Joi.string().min(8).trim().optional(),
  locationName: Joi.string().trim().optional().allow(null),
  locationPoint: Joi.object({
    type: Joi.string().valid('Point').default('Point'),
    coordinates: Joi.array().items(Joi.number()).length(2).default([0, 0]),
  })
    .optional()
    .allow(null),
  timezone: Joi.string().trim().optional(),
  role: Joi.string().valid('ADMIN', 'USER').trim().optional(),
  loginTryCount: Joi.number().optional(),
}).unknown(true);

export const userUpdateUserSchema = Joi.object({
  firstName: Joi.string().trim().lowercase().optional(),
  lastName: Joi.string().trim().lowercase().optional().allow(null),
  profileImage: Joi.string().trim().uri().optional().allow(null),
  email: Joi.string().email().trim().lowercase().optional(),
  countryCode: Joi.string().pattern(countryCodeRegex).trim().optional(),
  phoneNumber: Joi.string().pattern(phoneRegex).trim().optional(),
  gender: Joi.string()
    .valid(...Object.values(Gender))
    .optional(),
  password: Joi.string().min(8).trim().optional(),
  locationName: Joi.string().trim().optional().allow(null),
  locationPoint: Joi.object({
    type: Joi.string().valid('Point').default('Point'),
    coordinates: Joi.array().items(Joi.number()).length(2).default([0, 0]),
  })
    .optional()
    .allow(null),
  timezone: Joi.string().trim().optional(),
}).unknown(false);

export const validateRequestBody = (schema) => (req, res, next) => {
  const { error, value } = schema.validate(req.body, { abortEarly: false });
  if (error) return res.status(400).json({ error: error.details.map((d) => d.message) });
  req.body = value;
  next();
};
