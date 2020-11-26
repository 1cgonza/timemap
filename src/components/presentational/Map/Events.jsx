import React from 'react';
import { Portal } from 'react-portal';
import colors from '../../../common/global.js';
import { calcOpacity } from '../../../common/utilities';

function MapEvents({
  domain,
  getCategoryColor,
  // categories,
  projectPoint,
  // styleLocation,
  selected,
  narrative,
  onSelect,
  svg,
  locations,
  eventRadius,
  zoomLevel,
}) {
  function getCoordinatesForPercent(radius, percent) {
    const x = radius * Math.cos(2 * Math.PI * percent);
    const y = radius * Math.sin(2 * Math.PI * percent);
    return [x, y];
  }

  function handleEventSelect(e, location) {
    const events = e.shiftKey ? selected.concat(location.events) : location.events;
    onSelect(events);
  }

  function renderBorder() {
    return (
      <React.Fragment>
        {<circle class="event-hover" cx="0" cy="0" r="10" stroke={colors.primaryHighlight} fill-opacity="0.0" />}
      </React.Fragment>
    );
  }

  function renderLocationSlicesByCategory(location) {
    const locCategory = location.events.length > 0 ? location.events[0].category : 'default';
    // const customStyles = styleLocation ? styleLocation(location) : null;
    // const extraStyles = customStyles[0];

    let styles = {
      fill: getCategoryColor(locCategory),
      stroke: colors.darkBackground,
      strokeWidth: 0,
      fillOpacity: narrative ? 1 : calcOpacity(location.events.length),
      // ...extraStyles,
    };

    const colorSlices = location.events.map((e) => (e.colour ? e.colour : getCategoryColor(e.category)));

    let cumulativeAngleSweep = 0;

    return (
      <React.Fragment>
        {colorSlices.map((color, idx) => {
          const r = eventRadius;

          // Based on the number of events in each location,
          // create a slice per event filled with its category color
          const [startX, startY] = getCoordinatesForPercent(r, cumulativeAngleSweep);

          cumulativeAngleSweep = (idx + 1) / colorSlices.length;

          const [endX, endY] = getCoordinatesForPercent(r, cumulativeAngleSweep);

          // if the slices are less than 2, take the long arc
          const largeArcFlag = colorSlices.length === 1 ? 1 : 0;

          // create an array and join it just for code readability
          let arc = [
            `M ${startX} ${startY}`, // Move
            `A ${r} ${r} 0 ${largeArcFlag} 1 ${endX} ${endY}`, // Arc
            `L 0 0 `, // Line
            `L ${startX} ${startY} Z`, // Line
          ].join(' ');

          if (locCategory === 'Muerto') {
            arc = `M3.8,20 L10,0 l6.2,20 L0,7.6 h20`;
            styles.transform = 'translate(-9px, -9px)';
          }

          const extraStyles = {
            ...styles,
            fill: color,
          };

          return <path class="location-event-marker" id={`arc_${idx}`} d={arc} style={extraStyles} />;
        })}
      </React.Fragment>
    );
  }

  function renderLocation(location) {
    /**
    {
      events: [...],
      label: 'Location name',
      latitude: '47.7',
      longitude: '32.2'
    }
    */
    if (!location.latitude || !location.longitude) return null;
    const { x, y } = projectPoint([location.latitude, location.longitude]);

    // in narrative mode, only render events in narrative
    // TODO: move this to a selector
    if (narrative) {
      const { steps } = narrative;
      const onlyIfInNarrative = (e) => steps.map((s) => s.id).includes(e.id);
      const eventsInNarrative = location.events.filter(onlyIfInNarrative);

      if (eventsInNarrative.length <= 0) {
        return null;
      }
    }

    // const customStyles = styleLocation ? styleLocation(location) : null;
    // const extraRender = () => <React.Fragment>{customStyles[1]}</React.Fragment>;

    const isSelected = selected.reduce((acc, event) => {
      return acc || (event.latitude === location.latitude && event.longitude === location.longitude);
    }, false);

    return (
      <g
        className={`location-event ${narrative ? 'no-hover' : ''}`}
        transform={`translate(${x}, ${y})`}
        onClick={(e) => handleEventSelect(e, location)}
      >
        {renderLocationSlicesByCategory(location)}
        {/* {extraRender ? extraRender() : null} */}
        {isSelected ? null : renderBorder()}
      </g>
    );
  }

  const handleCaiOver = (e) => {
    const text = e.target.previousElementSibling;
    if (text) {
      text.classList.add('active');
    }
  };

  const handleCaiLeave = (e) => {
    const text = e.target.previousElementSibling;

    if (text) {
      text.classList.remove('active');
    }
  };

  function renderCais(cai, i) {
    if (zoomLevel < 13) return null;
    const { x, y } = projectPoint([cai.latitude, cai.longitude]);

    return (
      <g
        key={`cai${i}`}
        className="place-cai"
        onMouseEnter={handleCaiOver}
        onMouseOut={handleCaiLeave}
        transform={`translate(${x}, ${y})`}
      >
        <text className="cai-name">{cai.name}</text>
        <path
          className="cai-icon"
          width="110"
          height="12"
          transform={`scale(${zoomLevel ? zoomLevel / 11 : 1})`}
          fill="#68ba5e"
          d="M9.69,5.54c0,1-1.12,1.56-4.21,1.56S1.3,6.5,1.28,5.53c.75,0,2.19-1,4.2-1S9.06,5.54,9.69,5.54ZM5.48,7.59A13.4,13.4,0,0,1,3,7.39c0,.28.23,1.66,1.2,1.66S5,8.39,5.51,8.39s.58.66,1.43.66c1,0,1.23-1.53,1.24-1.7A12.28,12.28,0,0,1,5.48,7.59Zm3.21-.37a5,5,0,0,1-1.14,3.21,2.62,2.62,0,0,1-2,.85,2.64,2.64,0,0,1-2-.79,5.07,5.07,0,0,1-1.2-3.23,3.25,3.25,0,0,1-.74-.32A6,6,0,0,0,3.08,11a3.37,3.37,0,0,0,2.49,1,3.35,3.35,0,0,0,2.52-1.08,5.8,5.8,0,0,0,1.33-4A3.27,3.27,0,0,1,8.69,7.22ZM5.57,1.72,5.41,2l-.35,0,.25.24,0,.34.31-.16.31.16-.06-.34.26-.24L5.73,2Zm3.6-.1A20.16,20.16,0,0,1,5.5,0,20.16,20.16,0,0,1,1.83,1.62,14.57,14.57,0,0,1,0,4.13l1.13,1C1.9,5,3.45,4,5.5,4s3.6,1,4.37,1l1.13-1A14.57,14.57,0,0,1,9.17,1.62ZM6,3.23a.82.82,0,0,0-.44.2.75.75,0,0,0-.43-.2.67.67,0,0,1-.58-.65A1.64,1.64,0,0,1,4.71,2c.1-.25,0-.33-.06-.44l-.09-.08.5-.41a.34.34,0,0,0,.24.14.41.41,0,0,0,.27-.14.4.4,0,0,0,.26.14.34.34,0,0,0,.24-.14l.49.41-.08.08c-.1.11-.16.19-.06.45a1.77,1.77,0,0,1,.16.57A.67.67,0,0,1,6,3.23Z"
        />
        ¡{' '}
      </g>
    );
  }

  return (
    <Portal node={svg}>
      <g className="places-cais">{domain.cais.map(renderCais)}</g>
      <g className="event-locations">{locations.map(renderLocation)}</g>
    </Portal>
  );
}

export default MapEvents;
