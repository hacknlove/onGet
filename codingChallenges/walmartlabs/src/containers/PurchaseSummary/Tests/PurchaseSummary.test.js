import React from 'react';
import { shallow } from 'enzyme';
import toJson from 'enzyme-to-json';
import PurchaseSummary from '../index';
import { configure } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';

import { set } from 'onget'

set('dotted://purchaseData', {
  pricing: {
    subtotal: 102.96,
    previousPrice: 120.99,
    savings: 3.85,
    discount: 0.0,
    tax: 8.92,
    total: 108.95,
    zip: 94702
  },
  itemDetails: {
    itemName: 'OFM Essentials Racecar-Style Leather Gaming Chair, Green',
    pictureURL:
    "https://i5.walmartimages.com/asr/79916c35-3293-48ff-acff-be325b2e4c84_2.ef5b1bd1451de6b63a7c20d2485d56c6.jpeg?odnHeight=100&odnWidth=100&odnBg=FFFFFF",
    quantity: 1,
    price: 99.11,
    prevPrice: 102.96,
  }
})

configure({ adapter: new Adapter() });
describe('purchase summary container', () => {
  it('matches snapshot', function() {
    let wrapper = shallow(<PurchaseSummary url="dotted://purchaseData"/>);
    let serialized = toJson(wrapper);
    expect(serialized).toMatchSnapshot();
  });

  it('renders without crashing', function() {
    let wrapper = shallow(<PurchaseSummary url="dotted://purchaseData"/>);
    console.log(wrapper.debug());
  });
});
