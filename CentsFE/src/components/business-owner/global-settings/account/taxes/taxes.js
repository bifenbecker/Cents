import React, { useEffect, useState } from 'react';

// Icons
import IconTaxPercentage from '../../../../../assets/images/Icon_Tax_Percentage.svg';
import angleRight from '../../../../../assets/images/angle_right.svg';

// Components
import TextField from '../../../../commons/textField/textField';
import BlockingLoader from '../../../../commons/blocking-loader/blocking-loader';
import Modal from '../../../../commons/modal/modal';

const Taxes = ({
  fetchTaxes,
  saveTaxChanges,
  toggleTaxModal,
  closeTaxModal,
  accountSettings: { taxes, taxSaveInProgress, taxSaveError, showTaxModal },
}) => {
  const NewTax = {
    id: '',
    name: '',
    rate: '',
    taxAgency: '',
  };
  const [selectedTax, setSelectedTax] = useState(NewTax);

  useEffect(() => {
    fetchTaxes();
  }, [fetchTaxes]);

  const handleSelect = (tax) => {
    toggleTaxModal(true);
    setSelectedTax(tax);
  };

  const renderTaxes = () => {
    return taxes.map((tax) => (
      <div
        key={tax.id}
        className='region-item'
        onClick={() => handleSelect(tax)}>
        <img alt='icon' className='angleRight' src={angleRight}></img>
        <p>{tax.name}</p>
        <p>{tax.rate}</p>
        <p>{tax.taxAgency}</p>
      </div>
    ));
  };

  const isValidTax = () => {
    const {name, rate, taxAgency} = selectedTax;
    if (name && rate >= 0 && taxAgency) {
      return true;
    } else {
      return false;
    }
  }

  const renderModal = () => {
    const tax = selectedTax;

    return (
      <Modal>
        <div className='tax-popup-container'>
          {taxSaveInProgress ? <BlockingLoader /> : null}
          <div className='tax-popup-head'>
            <b className='header'>Tax Rate Setup</b>
          </div>
          <div className='tax-popup-content'>
            <form>
              <div className='form-inline'>
                <img alt='icon' src={IconTaxPercentage} />
                <TextField
                  key={`tax-${tax.id}-name`}
                  className='tax-popup-text tax-field'
                  label='Tax Rate Name'
                  value={tax.name === undefined ? '' : tax.name}
                  onChange={(e) =>
                    setSelectedTax({ ...tax, name: e.target.value })
                  }
                />
              </div>
              <TextField
                key={`tax-${tax.id}-rate`}
                className='tax-popup-text tax-field'
                label='Tax Rate'
                type='number'
                value={tax.rate === undefined ? '' : tax.rate}
                onChange={(e) =>
                  setSelectedTax({ ...tax, rate: parseFloat(e.target.value) })
                }
                suffix='%'
              />
              <TextField
                key={`tax-${tax.id}-agency`}
                className='tax-popup-text tax-field'
                label='Tax Agency'
                value={tax.taxAgency === undefined ? '' : tax.taxAgency}
                onChange={(e) =>
                  setSelectedTax({ ...tax, taxAgency: e.target.value })
                }
              />
              <p className='error-message'>{taxSaveError}</p>
            </form>
          </div>
          <div className='footer'>
            <p className='cancel-button' onClick={() => toggleTaxModal(false)}>
              Cancel
            </p>
            <button
              disabled={!isValidTax()}
              className='btn-theme form-save-button'
              onClick={async (e) => {
                e.preventDefault();
                saveTaxChanges(tax);
              }}>
              SAVE
            </button>
          </div>
        </div>
      </Modal>
    );
  };

  return (
    <div className='account-settings-container taxes-tab '>
      <div className='form-section regions-section'>
        <img alt='icon' src={IconTaxPercentage} />
        <div className='form-fields-container'>
          <b>Tax Rates</b>
        </div>
      </div>
      <div className='form-section regions-list-section'>
        <div
          className='region-item add-new-button'
          onClick={() => handleSelect(NewTax)}>
          <p>
            <span>+</span> Add new tax rate
          </p>
        </div>
        {renderTaxes()}
      </div>
      {showTaxModal ? renderModal() : null}
    </div>
  );
};

export default Taxes;
