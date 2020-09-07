import React from 'react'
import Checkbox from '../presentational/Checkbox'
import copy from '../../common/data/copy.json'

/** recursively get an array of node keys to toggle */
function childrenToToggle (filter, activeFilters, parentOn) {
  const [key, children] = filter
  const isOn = activeFilters.includes(key)
  if (children === {}) {
    return [key]
  }
  const childKeys = Object.entries(children)
    .flatMap(filter => childrenToToggle(filter, activeFilters, isOn))
  // NB: if turning a parent off, don't toggle off children on.
  //     likewise if turning a parent on, don't toggle on children off
  if (!((!parentOn && isOn) || (parentOn && !isOn))) {
    childKeys.push(key)
  }
  return childKeys
}

function aggregatePaths (filters) {
  const aggregated = {}

  filters.forEach(item => {
    let currentDepth = aggregated

    item.filter_paths.forEach(path => {
      if (!(path in aggregated)) {
        currentDepth[path] = {}
      }
      currentDepth = currentDepth[path]
    })
  })

  return aggregated
}

function FilterListPanel ({
  filters,
  activeFilters,
  onSelectFilter,
  language
}) {
  function createNodeComponent (filter, depth) {
    const [key, children] = filter
    const matchingKeys = childrenToToggle(filter, activeFilters, activeFilters.includes(key))

    return (
      <li
        key={key.replace(/ /g, '_')}
        className={'filter-filter'}
        style={{ marginLeft: `${depth * 20}px` }}
      >
        <Checkbox
          label={key}
          isActive={activeFilters.includes(key)}
          onClickCheckbox={() => onSelectFilter(matchingKeys)}
        />
        {Object.keys(children).length > 0
          ? Object.entries(children).map(filter => createNodeComponent(filter, depth + 1))
          : null}
      </li>
    )
  }

  function renderTree (filters) {
    const aggregatedFilterPaths = aggregatePaths(filters)
    return (
      <div>
        {Object.entries(aggregatedFilterPaths).map(filter => createNodeComponent(filter, 1))}
      </div>
    )
  }

  return (
    <div className='react-innertabpanel'>
      <h2>{copy[language].toolbar.filters}</h2>
      <p>{copy[language].toolbar.explore_by_filter__description}</p>
      {renderTree(filters)}
    </div>
  )
}

export default FilterListPanel
