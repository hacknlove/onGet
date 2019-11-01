import React, { PureComponent } from 'react';
import './style.css';
import PropTypes from 'prop-types';

export default class ItemDetails extends PureComponent {
  render() {
    return (
      <div className="item-details">
        <img
          className="item-picture"
          src={this.props.pictureURL}
          alt={this.props.itemName}
        />
        <div className="item-name">{this.props.itemName}</div>
        <div className="item-price">${this.props.price}</div>
        <div className="item-quantity">Qty:{this.props.quantity}</div>
        <div className="item-previous-price">${this.props.prevPrice}</div>
      </div>
    );
  }
}

ItemDetails.propTypes = {
  pictureURL: PropTypes.string,
  itemName: PropTypes.string,
  quantity: PropTypes.number,
  prevPrice: PropTypes.number
};
