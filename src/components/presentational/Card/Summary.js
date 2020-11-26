import React from 'react';

import copy from '../../../common/data/copy.json';

function isValidURL(string) {
  var res = string.match(
    /(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/g
  );
  return res !== null;
}

const getVideos = (videos) => {
  if (videos && videos.length) {
    return videos.map((fileName, i) => {
      return (
        <video key={fileName} className="video" width="550" height="380" controls>
          <source src={`./videos/${fileName}.mp4`} type="video/mp4" />
        </video>
      );
    });
  }
};

const getVictimName = (nombre) => {
  if (nombre) {
    return (
      <p className="nombre-muerto">
        <span className="star" />
        {nombre}
        <span className="star" />
      </p>
    );
  }

  return null;
};

const getSource = (source) => {
  if (source) {
    if (isValidURL(source)) {
      source = (
        <a className="fuente" href={source} target="_blank">
          {source}
        </a>
      );
    }

    return (
      <div className="fuente">
        <h4>Fuente:</h4>
        {source}
      </div>
    );
  }

  return null;
};

const CardSummary = ({ language, data }) => {
  const summary = copy[language].cardstack.description;
  const nombre = getVictimName(data.nombre);
  const fuente = getSource(data.fuente);

  return (
    <div className="card-row summary">
      <div className="card-cell">
        <p className="card-categoria">{`Categoria: ${data.category}`}</p>
        {nombre}
        <h4>{summary}</h4>
        <p>{data.description}</p>
        {getVideos(data.videos)}
        {fuente}
      </div>
    </div>
  );
};

export default CardSummary;
