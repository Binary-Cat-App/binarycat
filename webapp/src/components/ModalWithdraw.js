import React from 'react';
import NumberFormat from 'react-number-format';
import { Button } from './Button';
import { Modal } from './Modal';
import { Alert } from './Alert';

export const ModalWithdraw = ({ onWithdraw }) => {
  const [showModal, setShowModal] = React.useState(false);
  const [error, setError] = React.useState(false);
  const [value, setValue] = React.useState(false);

  const handleModalToggle = React.useCallback(() => {
    setShowModal(!showModal);
  }, [showModal]);

  return (
    <div>
      <Button
        variant="default"
        outline
        className="ml-4"
        handleClick={handleModalToggle}
      >
        Withdraw
      </Button>
      {showModal && (
        <Modal title="Withdraw" handleModalToggle={handleModalToggle}>
          <div className="mb-4 pb-2">
            Your Current Balance is <strong>10 ETH</strong>
          </div>
          {error && <Alert color="red" />}
          <div className="min-w-0 flex items-center mb-4 py-2 px-4 bg-gray-100 rounded">
            <NumberFormat
              thousandSeparator=" "
              decimalSeparator="."
              decimalScale="2"
              fixedDecimalScale="2"
              allowNegative="false"
              autoFocus
              className="form-control font-digits text-xl border-0 bg-transparent text-center"
              value={value}
              onValueChange={(values) => {
                setValue(values.formattedValue);
              }}
            />

            <label htmlFor="betAmount" className="ml-2 text-lg flex-shrink-0">
              ETH
            </label>
          </div>
          <div className="flex items-center -mx-2">
            <div className="px-2 flex-grow">
              <Button
                variant="default"
                className="w-full"
                outline
                handleClick={handleModalToggle}
              >
                Cancel
              </Button>
            </div>
            <div className="px-2 flex-grow">
              <Button
                variant="green"
                className="w-full"
                handleClick={() => {
                  onWithdraw(value);
                  setShowModal(!showModal);
                }}
              >
                Withdraw
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
