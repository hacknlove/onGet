import React from 'react';
import { shallow, mount } from 'enzyme';
import toJson from 'enzyme-to-json';
import DiscountForm from './index';
import { configure } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';

configure({ adapter: new Adapter() });
describe('discount form component', () => {
  it('matches snapshot', function() {
    let wrapper = shallow(<DiscountForm />);
    let serialized = toJson(wrapper);
    expect(serialized).toMatchSnapshot();
  });

  it('renders without crashing', function() {
    let wrapper = mount(<DiscountForm />);
    console.log(wrapper.debug());
  });

  it('the input value changes as state changes', function() {
    let wrapper = mount(<DiscountForm />);
    wrapper.setState({ promoCode: 'DISCOUNT' });
    const input = wrapper.find('#promoCode');

    expect(input.matchesElement(<input value="DISCOUNT" />));
  });

  it('the on change the state changes', function() {
    let wrapper = mount(<DiscountForm />);
    const event = { target: { name: 'promoCode', value: 'DISCOUNT' } };
    const input = wrapper.find('#promoCode');
    input.simulate('change', event);

    expect(wrapper.state().promoCode).toBe('DISCOUNT');
  });
});
