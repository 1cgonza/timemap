import Joi from 'joi';

export default Joi.object().keys({
  name: Joi.string().required(),
  localidad: Joi.string(),
  latitude: Joi.string(),
  longitude: Joi.string(),
});
