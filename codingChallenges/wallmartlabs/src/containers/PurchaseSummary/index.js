import React from 'react';
import { useOnGet } from 'onget'
import Row from '../../components/Row';
import ExpandableItem from '../../components/ExpandableItem';
import DiscountForm from '../../components/DiscountForm';
import ItemDetails from '../../components/ItemDetails';
import ToolTip from '../../components/ToolTip';
import './style.css';


export default function PurchaseSummary ({ url }) {
  const purchaseData = useOnGet(url)
  if (!purchaseData) {
    return null
  }

  return (
    <div className="purchase-summary">
      <Row title="Subtotal" figure={purchaseData.pricing.subtotal} />
      <Row
        title="Pickup savings"
        figure={purchaseData.pricing.savings}
        less={true}
        toolTip={
          <ToolTip
            title="Pickup savings"
            desc="Picking up your order in the store helps cut costs, and we pass the savings on to you."
          />
        }
      />
      {purchaseData.pricing.discount > 0 ? (
        <Row
          title="Discount"
          figure={purchaseData.pricing.discount}
          less={true}
        />
      ) : null}
      <Row title="Est. taxes and fees" figure={purchaseData.pricing.tax}>
        <div>(Based on {purchaseData.pricing.zip})</div>
      </Row>
      <Row
        total={true}
        title="Est. total"
        figure={purchaseData.pricing.total}
      />
      <ExpandableItem
        openPrefix={'See'}
        closePrefix={'Hide'}
        title={'item details'}
      >
        <ItemDetails {...purchaseData.itemDetails} />
      </ExpandableItem>
      <ExpandableItem
        openPrefix={'Apply'}
        closePrefix={'Hide'}
        title={'promo code'}
      >
        <DiscountForm url={url} />
      </ExpandableItem>
    </div>
  );
}
