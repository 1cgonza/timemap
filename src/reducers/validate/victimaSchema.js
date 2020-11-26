import Joi from 'joi';

export default Joi.object().keys({
  id: Joi.string(),
  nombre: Joi.string(),
  fecha: Joi.string(),
  descripcion: Joi.string(),
  fuente: Joi.string().allow(''),
  latitude: Joi.string().optional(),
  longitude: Joi.string().optional(),
});
