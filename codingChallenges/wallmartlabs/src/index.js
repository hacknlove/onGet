import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import PurchaseSummaryContainer from './containers/PurchaseSummary';
import * as serviceWorker from './serviceWorker';
import { set } from 'onget'

set('dotted://purchaseDataMock', {
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

ReactDOM.render(<PurchaseSummaryContainer url="dotted://purchaseDataMock"/>, document.getElementById('root'));

serviceWorker.unregister();
