const Joi = require("joi");
const { HTTP_STATUS } = require("../config/constants");
const logger = require("../utils/logger");

/**
 * Validation middleware factory
 */
const validate = (schema, source = "body") => {
  return (req, res, next) => {
    const dataToValidate = req[source];
    const { error, value } = schema.validate(dataToValidate, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const errors = error.details.map((detail) => ({
        field: detail.path.join("."),
        message: detail.message.replace(/"/g, ""),
      }));

      logger.warn("Validation failed:", { errors, path: req.path });

      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        status: "fail",
        message: "Validation failed",
        errors,
      });
    }

    // Replace body/params/query with validated value
    req[source] = value;
    next();
  };
};

// Validation schemas
const eventSchema = Joi.object({
  courseName: Joi.string().required().min(3).max(200).trim(),
  venue: Joi.string().required().min(3).max(200).trim(),
  date: Joi.date().required().iso(),
  price: Joi.number().required().min(0),
  emailText: Joi.string().required().min(10).trim(),
});

const submissionSchema = Joi.object({
  eventId: Joi.string().required().trim(),
  type: Joi.string().required().valid("person", "company"),
  name: Joi.string().required().min(2).max(100).trim(),
  email: Joi.string().required().email().lowercase().trim(),
});

const updateSubmissionSchema = Joi.object({
  paid: Joi.boolean().required(),
});

const idParamSchema = Joi.object({
  id: Joi.string().required().trim(),
});

module.exports = {
  validate,
  eventSchema,
  submissionSchema,
  updateSubmissionSchema,
  idParamSchema,
};
