import React, { PureComponent } from 'react';
import './style.css';

export default class ExpandableItem extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      expanded: false
    };
    this.handleClick = this.handleClick.bind(this);
  }

  handleClick(e) {
    this.setState(st => ({
      expanded: !st.expanded
    }));
  }

  render() {
    let expandComponent = this.state.expanded ? this.props.children : null;
    return (
      <div className="expandable-information">
        <button className="ui-button" onClick={this.handleClick}>
          {this.state.expanded ? this.props.closePrefix : this.props.openPrefix}{' '}
          {this.props.title}
          <span className="expand-sign">{this.state.expanded ? '-' : '+'}</span>
        </button>{' '}
        {expandComponent}
      </div>
    );
  }
}
