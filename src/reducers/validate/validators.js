import Joi from 'joi';

import createEventSchema from './eventSchema';
import placeSchema from './placeSchema';
import categorySchema from './categorySchema';
import victimaSchema from './victimaSchema';
import siteSchema from './siteSchema';
import associationsSchema from './associationsSchema';
import sourceSchema from './sourceSchema';
import shapeSchema from './shapeSchema';

import { calcDatetime, capitalize } from '../../common/utilities';

/*
 * Create an error notification object
 * Types: ['error', 'warning', 'good', 'neural']
 */
function makeError(type, id, message) {
  return {
    type: 'error',
    id,
    message: `${type} ${id}: ${message}`,
  };
}

function isValidDate(d) {
  return d instanceof Date && !isNaN(d);
}

function findDuplicateAssociations(associations) {
  const seenSet = new Set([]);
  const duplicates = [];
  associations.forEach((item) => {
    if (seenSet.has(item.id)) {
      duplicates.push({
        id: item.id,
        error: makeError('Association', item.id, 'association was found more than once. Ignoring duplicate.'),
      });
    } else {
      seenSet.add(item.id);
    }
  });
  return duplicates;
}

/*
 * Validate domain schema
 */
export function validateDomain(domain, features) {
  const sanitizedDomain = {
    events: [],
    cais: [],
    categories: [],
    victimas: [],
    // sites: [],
    associations: [],
    // sources: {},
    // shapes: [],
    notifications: domain ? domain.notifications : null,
  };

  if (domain === undefined) {
    return sanitizedDomain;
  }

  const discardedDomain = {
    events: [],
    cais: [],
    categories: [],
    victimas: [],
  };

  function validateArrayItem(item, domainKey, schema) {
    const { error, value } = schema.validate(item);

    if (error) {
      const id = item.id || '-';
      const domainStr = capitalize(domainKey);
      const err = makeError(domainStr, id, error.message);

      discardedDomain[domainKey].push(Object.assign(item, { err }));
    } else {
      sanitizedDomain[domainKey].push(value);
    }
  }

  function validateArray(items, domainKey, schema) {
    items.forEach((item) => {
      validateArrayItem(item, domainKey, schema);
    });
  }

  function validateObject(obj, domainKey, itemSchema) {
    Object.keys(obj).forEach((key) => {
      const vl = obj[key];
      const result = Joi.validate(vl, itemSchema);
      if (result.error !== null) {
        const id = vl.id || '-';
        const domainStr = capitalize(domainKey);
        discardedDomain[domainKey].push({
          ...vl,
          error: makeError(domainStr, id, result.error.message),
        });
      } else {
        sanitizedDomain[domainKey][key] = vl;
      }
    });
  }

  if (!Array.isArray(features.CUSTOM_EVENT_FIELDS)) {
    features.CUSTOM_EVENT_FIELDS = [];
  }

  domain.victimas
    .filter((v) => v.latitude && v.longitude)
    .forEach((v) => {
      const ret = {
        id: v.id,
        location: v.lugar,
        category: 'Muerto',
        date: v.fecha,
        description: v.descripcion,
        fuente: v.fuente,
        nombre: v.nombre,
      };

      if (v.latitude) ret.latitude = v.latitude;
      if (v.longitude) ret.longitude = v.longitude;
      domain.eventos.push(ret);
    });

  domain.eventos.forEach((evento) => {
    const match = domain.cais.find((cai) => cai.name === evento.location);

    if (match) evento.location = `${evento.location} (${match.localidad})`;
  });

  const eventSchema = createEventSchema(features.CUSTOM_EVENT_FIELDS);
  validateArray(domain.eventos, 'events', eventSchema);
  validateArray(domain.cais, 'cais', placeSchema);
  // validateArray(domain.filters, 'filters', Joi.string());
  validateArray(domain.categories, 'categories', categorySchema);
  // validateArray(domain.sites, 'sites', siteSchema);
  // validateArray(domain.associations, 'associations', associationsSchema);
  // validateObject(domain.sources, 'sources', sourceSchema);
  // validateObject(domain.shapes, 'shapes', shapeSchema);

  // NB: [lat, lon] array is best format for projecting into map
  // sanitizedDomain.shapes = sanitizedDomain.shapes.map((shape) => ({
  //   name: shape.name,
  //   points: shape.items.map((coords) => coords.replace(/\s/g, '').split(',')),
  // }));

  // const duplicateAssociations = findDuplicateAssociations(domain.associations);
  // // Duplicated associations
  // if (duplicateAssociations.length > 0) {
  //   sanitizedDomain.notifications.push({
  //     message: `Associations are required to be unique. Ignoring duplicates for now.`,
  //     items: duplicateAssociations,
  //     type: 'error',
  //   });
  // }
  // sanitizedDomain.associations = domain.associations;

  // append events with datetime and sort
  sanitizedDomain.events = sanitizedDomain.events.filter((event, idx) => {
    event.id = idx;
    event.datetime = calcDatetime(event.date, event.time);
    if (!isValidDate(event.datetime)) {
      discardedDomain['events'].push({
        ...event,
        error: makeError(
          'event',
          event.id,
          `Invalid date. It's been dropped, as otherwise timemap won't work as expected.`
        ),
      });
      return false;
    }
    return true;
  });

  sanitizedDomain.events.sort((a, b) => a.datetime - b.datetime);

  // Message the number of failed items in domain
  Object.keys(discardedDomain).forEach((disc) => {
    const len = discardedDomain[disc].length;
    if (len) {
      sanitizedDomain.notifications.push({
        message: `${len} invalid ${disc} not displayed.`,
        items: discardedDomain[disc],
        type: 'error',
      });
    }
  });

  return sanitizedDomain;
}
