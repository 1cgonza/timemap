import React, { Component, createRef, Fragment } from 'react';
import * as d3 from 'd3';

class TimelineCategories extends Component {
  constructor(props) {
    super(props);
    this.grabRef = createRef();
    this.state = {
      isInitialized: false,
    };
  }

  componentDidUpdate() {
    if (!this.state.isInitialized) {
      const drag = d3
        .drag()
        .on('start', this.props.onDragStart)
        .on('drag', this.props.onDrag)
        .on('end', this.props.onDragEnd);

      d3.select(this.grabRef.current).call(drag);

      this.setState({ isInitialized: true });
    }
  }

  renderCategory(cat, idx) {
    const { features, dims } = this.props;
    const { category } = cat;
    const strokeWidth = 1; // dims.trackHeight / (this.props.categories.length + 1)
    const color = this.props.getCategoryColor(category);

    if (
      features.GRAPH_NONLOCATED &&
      features.GRAPH_NONLOCATED.categories &&
      features.GRAPH_NONLOCATED.categories.includes(category)
    ) {
      return null;
    }

    return (
      <Fragment>
        <g
          className="tick"
          style={{ strokeWidth }}
          opacity="0.5"
          transform={`translate(0,${this.props.getCategoryY(category)})`}
        >
          <line x1={dims.marginLeft} x2={dims.width - dims.width_controls} />
        </g>
        <g className="tick" opacity="1" transform={`translate(0,${this.props.getCategoryY(category)})`}>
          <text x={dims.marginLeft - 5} dy="0.32em" fill={color}>
            {category}
          </text>
        </g>
      </Fragment>
    );
  }

  render() {
    const { dims } = this.props;
    // Needed to fix render error, probably fired too early in the lifecycle where dims as not set.
    if (dims.width === 0) return '';
    const categories = this.props.features.USE_CATEGORIES
      ? this.props.categories.map((cat, idx) => this.renderCategory(cat, idx))
      : this.renderCategory('Events', 0);

    return (
      <g className="yAxis">
        {categories}
        <rect
          ref={this.grabRef}
          className="drag-grabber"
          x={dims.marginLeft}
          y={dims.marginTop}
          width={dims.width - dims.marginLeft - dims.width_controls}
          height="100%"
        />
      </g>
    );
  }
}

export default TimelineCategories;
