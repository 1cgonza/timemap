import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as actions from '../../actions';
import * as selectors from '../../selectors';

import { Tabs, TabPanel } from 'react-tabs';
import FilterListPanel from './FilterListPanel';
import CategoriesListPanel from './CategoriesListPanel';
import BottomActions from './BottomActions';
import copy from '../../common/data/copy.json';
import { trimAndEllipse } from '../../common/utilities.js';

class Toolbar extends Component {
  constructor(props) {
    super(props);
    this.state = { _selected: -1 };
    this.infoRef = React.createRef();
  }

  selectTab(selected) {
    const _selected = this.state._selected === selected ? -1 : selected;
    this.setState({ _selected });
  }

  renderClosePanel() {
    return (
      <div className="panel-header" onClick={() => this.selectTab(-1)}>
        <div className="caret" />
      </div>
    );
  }

  goToNarrative(narrative) {
    this.selectTab(-1); // set all unselected within this component
    this.props.methods.onSelectNarrative(narrative);
  }

  renderToolbarNarrativePanel() {
    return (
      <TabPanel>
        <h2>{copy[this.props.language].toolbar.narrative_panel_title}</h2>
        <p>{copy[this.props.language].toolbar.narrative_summary}</p>
        {this.props.narratives.map((narr, i) => {
          return (
            <div key={`tab${i}`} className="panel-action action">
              <button
                onClick={() => {
                  this.goToNarrative(narr);
                }}
              >
                <p>{narr.id}</p>
                <p>
                  <small>{trimAndEllipse(narr.desc, 120)}</small>
                </p>
              </button>
            </div>
          );
        })}
      </TabPanel>
    );
  }

  renderToolbarCategoriesPanel() {
    if (this.props.features.CATEGORIES_AS_FILTERS) {
      return (
        <TabPanel>
          <CategoriesListPanel
            categories={this.props.categories}
            activeCategories={this.props.activeCategories}
            onCategoryFilter={this.props.methods.onCategoryFilter}
            language={this.props.language}
          />
        </TabPanel>
      );
    }
  }

  renderToolbarFilterPanel() {
    return (
      <TabPanel>
        <FilterListPanel
          filters={this.props.filters}
          activeFilters={this.props.activeFilters}
          onSelectFilter={this.props.methods.onSelectFilter}
          language={this.props.language}
        />
      </TabPanel>
    );
  }

  renderToolbarTab(_selected, label, iconKey) {
    const isActive = this.state._selected === _selected;
    let classes = isActive ? 'toolbar-tab active' : 'toolbar-tab';

    return (
      <div
        className={classes}
        onClick={() => {
          this.selectTab(_selected);
        }}
      >
        <i className="material-icons">{iconKey}</i>
        <div className="tab-caption">{label}</div>
      </div>
    );
  }

  renderToolbarPanels() {
    const { features, narratives } = this.props;
    let classes = this.state._selected >= 0 ? 'toolbar-panels' : 'toolbar-panels folded';
    return (
      <div className={classes}>
        {this.renderClosePanel()}
        <Tabs selectedIndex={this.state._selected} onSelect={(firstTab, lastTab) => ''}>
          {narratives && narratives.length !== 0 ? this.renderToolbarNarrativePanel() : null}
          {features.CATEGORIES_AS_FILTERS ? this.renderToolbarCategoriesPanel() : null}
          {features.USE_ASSOCIATIONS ? this.renderToolbarFilterPanel() : null}
        </Tabs>
      </div>
    );
  }

  renderToolbarNavs() {
    if (this.props.narratives) {
      return this.props.narratives.map((nar, idx) => {
        const isActive = idx === this.state._selected;

        let classes = isActive ? 'toolbar-tab active' : 'toolbar-tab';

        return (
          <div
            key={`nav${idx}`}
            className={classes}
            onClick={() => {
              this.selectTab(idx);
            }}
          >
            <div className="tab-caption">{nar.label}</div>
          </div>
        );
      });
    }
    return null;
  }

  handleClose = (e) => {
    this.infoRef.current.classList.add('hidden');
  };

  renderInfo() {
    return (
      <div ref={this.infoRef} className="historiaInfo">
        <div className="closeBtn" onClick={this.handleClose}>
          X
        </div>
        <h2>¡Están disparando!: los puntos donde la policía desenfundó sus armas en el #9S y #10S</h2>
        <p>
          Periodistas de 070 geolocalizaron videos donde hay evidencia de uso de armas de fuego durante las protestas
          del 9 y 10 de septiembre de 2020 en Bogotá y Soacha. Esas noches, por balas, murieron 14 personas y 75
          quedaron heridas, según reportes de hospitales.
        </p>
        <p>
          Cada punto en el mapa corresponde al lugar en el que un video registra a un agente de policía disparando; se
          oyen detonaciones en presencia de policías; o se oyen detonaciones pero no se identifica el origen.
        </p>
        <p>
          El análisis muestra que — con certeza— la policía disparó al menos 345 veces sus armas de fuego en los
          alrededores de 17 CAI de la ciudad. En otras 1116 detonaciones registradas no hay imagen de la policía
          disparando, aunque en la mayoría de esos eventos se ve su presencia.
        </p>
        <p>El análisis visual o sonoro no permite identificar el tipo de munición o arma utilizada.</p>
        <p className="resaltar">Este mapa sigue abierto y se irá alimentando con nuevos registros.</p>

        <h3>Créditos</h3>
        <p>
          Investigación de fuente abierta y análisis por <a href="https://cerosetenta.uniandes.edu.co/">Cerosetenta</a>.
        </p>
        <p>
          Software y espacialización por{' '}
          <a href="https://forensic-architecture.org/" target="_blank">
            Forensic Architecture
          </a>
          .
        </p>
        <p>
          Asesoría editorial por{' '}
          <a href="https://www.bellingcat.com/" target="_blank">
            Bellingcat
          </a>
          .
        </p>
      </div>
    );
  }

  renderToolbarTabs() {
    // const { features, narratives } = this.props;
    // const narrativesExist = narratives && narratives.length !== 0;
    let title = copy[this.props.language].toolbar.title;
    if (process.env.display_title) title = process.env.display_title;
    // const narrativesLabel = copy[this.props.language].toolbar.narratives_label;
    // const filtersLabel = copy[this.props.language].toolbar.filters_label;
    // const categoriesLabel = 'Categorías'; // TODO:

    // const narrativesIdx = 0;
    // const categoriesIdx = narrativesExist ? 1 : 0;
    // const filtersIdx =
    //   narrativesExist && features.CATEGORIES_AS_FILTERS ? 2 : narrativesExist || features.CATEGORIES_AS_FILTERS ? 1 : 0;
    return (
      <div className="toolbar">
        <div className="toolbar-header" onClick={this.props.methods.onTitle}>
          <p>{title}</p>
        </div>
        <div className="toolbar-tabs">
          <div
            className="toolbar-tab"
            onClick={() => {
              this.infoRef.current.classList.remove('hidden');
            }}
          >
            <i className="material-icons">star</i>
            <div className="tab-caption">¡Están disparando!</div>
          </div>
          {/* {narrativesExist ? this.renderToolbarTab(narrativesIdx, narrativesLabel, 'timeline') : null}
          {features.CATEGORIES_AS_FILTERS ? this.renderToolbarTab(categoriesIdx, categoriesLabel, 'widgets') : null}
          {features.USE_ASSOCIATIONS ? this.renderToolbarTab(filtersIdx, filtersLabel, 'filter_list') : null} */}
        </div>
        <BottomActions
          info={{
            enabled: this.props.infoShowing,
            toggle: this.props.actions.toggleInfoPopup,
          }}
          sites={{
            enabled: this.props.sitesShowing,
            toggle: this.props.actions.toggleSites,
          }}
          cover={{
            toggle: this.props.actions.toggleCover,
          }}
          features={this.props.features}
        />
      </div>
    );
  }

  render() {
    const { isNarrative } = this.props;

    return (
      <div id="toolbar-wrapper" className={`toolbar-wrapper ${isNarrative ? 'narrative-mode' : ''}`}>
        {this.renderInfo()}
        {this.renderToolbarTabs()}
        {this.renderToolbarPanels()}
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    filters: selectors.getFilters(state),
    categories: selectors.getCategories(state),
    narratives: selectors.selectNarratives(state),
    language: state.app.language,
    activeFilters: selectors.getActiveFilters(state),
    activeCategories: selectors.getActiveCategories(state),
    viewFilters: state.app.associations.views,
    narrative: state.app.associations.narrative,
    sitesShowing: state.app.flags.isShowingSites,
    infoShowing: state.app.flags.isInfopopup,
    features: selectors.getFeatures(state),
  };
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators(actions, dispatch),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(Toolbar);
