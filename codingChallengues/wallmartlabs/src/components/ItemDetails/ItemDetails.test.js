import React from 'react';
import { shallow, mount } from 'enzyme';
import toJson from 'enzyme-to-json';
import ItemDetails from './index';
import { configure } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';

configure({ adapter: new Adapter() });

describe('item details component', () => {
  it('matches snapshot', function() {
    let wrapper = shallow(<ItemDetails />);
    let serialized = toJson(wrapper);
    expect(serialized).toMatchSnapshot();
  });

  it('renders without crashing', function() {
    let wrapper = mount(<ItemDetails />);
    console.log(wrapper.debug());
  });
});
