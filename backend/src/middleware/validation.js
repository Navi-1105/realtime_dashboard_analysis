import Joi from 'joi';

export const eventSchema = Joi.object({
  timestamp: Joi.date().iso().required(),
  userId: Joi.string().optional(),
  sessionId: Joi.string().optional(),
  route: Joi.string().required(),
  action: Joi.string().required(),
  metadata: Joi.object().optional(),
  clientEventId: Joi.string().optional()
});

export function validateEvent(req, res, next) {
  const { error, value } = eventSchema.validate(req.body);
  if (error) return res.status(400).json({ error: 'Validation error', details: error.details.map(d => d.message) });
  req.validatedEvent = value;
  next();
}


