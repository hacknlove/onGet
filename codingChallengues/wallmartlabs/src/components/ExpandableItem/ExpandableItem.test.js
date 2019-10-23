import React from 'react';
import { shallow, mount } from 'enzyme';
import toJson from 'enzyme-to-json';
import ExpandableItem from './index';
import { configure } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';

configure({ adapter: new Adapter() });

describe('expandable item component', () => {
  it('matches snapshot', function() {
    let wrapper = shallow(<ExpandableItem />);
    let serialized = toJson(wrapper);
    expect(serialized).toMatchSnapshot();
  });

  it('renders without crashing', function() {
    let wrapper = mount(<ExpandableItem />);
    console.log(wrapper.debug());
  });

  it('it expands when clicked', function() {
    let wrapper = shallow(
      <ExpandableItem
        expandComponent={<div className="expanded">expanded</div>}
      />
    );
    expect(wrapper.state().expanded).toBe(false);
    expect(!wrapper.exists('.expanded'));

    let button = wrapper.find('button').first();
    button.simulate('click');
    expect(wrapper.state().expanded).toBe(true);

    expect(wrapper.exists('.expanded'));
  });
});
