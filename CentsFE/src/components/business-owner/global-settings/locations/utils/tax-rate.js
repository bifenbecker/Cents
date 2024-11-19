export const buildTaxRateOptions = (taxRatesList) => {
  let taxRatesArray = (taxRatesList || []).map((taxRate) => {
    return {
      value: taxRate.id,
      label: `${taxRate.name} (${taxRate.rate}%)`,
      taxRate,
    };
  });
  taxRatesArray.unshift({
    value: "new-tax-rate",
    label: "+ Add New Tax Rate",
  });
  return taxRatesArray;
};

export const findSelectedTaxRate = (taxRatesOptions, selectedTaxRate) => {
  return (
    taxRatesOptions.find((opt) => opt.value === selectedTaxRate?.id) || null
  );
};
