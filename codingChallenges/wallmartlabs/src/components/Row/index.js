import React, { PureComponent } from 'react';
import './style.css';
import PropTypes from 'prop-types';

export default class Row extends PureComponent {
  render() {
    return (
      <div className={this.props.total ? 'row grand-total' : 'row'}>
        {this.props.toolTip ? (
          this.props.toolTip
        ) : (
          <div className="row-title">
            {this.props.title}
            {this.props.children}
          </div>
        )}
        <div
          style={
            this.props.less === true ? { color: 'red' } : { color: 'black' }
          }
          className="row-figure"
        >
          {this.props.less ? '-' : ''}${this.props.figure}
        </div>
      </div>
    );
  }
}

Row.propTypes = {
  total: PropTypes.bool,
  less: PropTypes.bool,
  toolTip: PropTypes.element,
  children: PropTypes.element,
  figure: PropTypes.number,
  title: PropTypes.string
};
