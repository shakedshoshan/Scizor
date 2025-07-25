import * as Joi from 'joi';

export const validationSchema = Joi.object({
  NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),
  OPENAI_API_KEY: Joi.string().required(),
  ENHANCE_PROMPT_MODEL: Joi.string().default('gpt-3.5-turbo'),
  GENERATE_RESPONSE_MODEL: Joi.string().default('gpt-3.5-turbo'),
});