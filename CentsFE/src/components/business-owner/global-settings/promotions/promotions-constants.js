export const DROPDOWN_OPTIONS = {
  promotionType: [
    {
      label: 'Fixed Price Discount',
      value: 'fixed-price-discount'
    },
    {
      label: 'Percentage Discount',
      value: 'percentage-discount'
    }
  ],

  appliesToType: [
    {
      label: 'Entire order',
      value: 'entire-order'
    },
    {
      label: 'Specific products & services',
      value: 'specific-items'
    }
  ],

  minRequirementType: [
    {
      label: 'No minimum',
      value: 'none'
    },
    {
      label: 'Min. purchase amount',
      value: 'min-purchase-amount'
    },
    {
      label: 'Min. quantity of items',
      value: 'min-quantity'
    }
  ],

  locationEligibilityType: [
    {
      label: 'Any location',
      value: 'any-location'
    },
    {
      label: 'Specific locations',
      value: 'specific-locations'
    }
  ],

  usageLimitTypes: [
    {
      label: 'No limits',
      value: 'none'
    },
    {
      label: 'Limit one per customer',
      value: 'one-per-customer'
    },
    {
      label: 'Limit multiple per customer',
      value: 'multiple-per-customer'
    }
  ]
}