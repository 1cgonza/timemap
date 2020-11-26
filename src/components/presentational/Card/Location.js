import React from 'react';

import copy from '../../../common/data/copy.json';

const CardLocation = ({ language, data, isPrecise }) => {
  if (data.location !== '') {
    return (
      <div className="card-cell location">
        <p>
          <i className="material-icons left">location_on</i>
          {`${data.location}${isPrecise ? '' : ' (Aproximado)'}`}
        </p>
      </div>
    );
  } else {
    const unknown = copy[language].cardstack.unknown_location;
    return (
      <div className="card-cell location">
        <p>
          <i className="material-icons left">location_on</i>
          {unknown}
        </p>
      </div>
    );
  }
};

export default CardLocation;
