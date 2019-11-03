import React from 'react';
import { shallow, mount } from 'enzyme';
import toJson from 'enzyme-to-json';
import ToolTip from './index';
import { configure } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';

configure({ adapter: new Adapter() });

describe('tooltip component', () => {
  it('matches snapshot', function() {
    let wrapper = shallow(<ToolTip />);
    let serialized = toJson(wrapper);
    expect(serialized).toMatchSnapshot();
  });

  it('renders without crashing', function() {
    let wrapper = mount(<ToolTip />);
    console.log(wrapper.debug());
  });
});
