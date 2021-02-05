import React from 'react';
import NumberFormat from 'react-number-format';
import { Button } from './Button';
import { Modal } from './Modal';
import { Alert } from './Alert';
import { useMetaMask } from '../context/MataMaskContext';

export const ModalDeposit = ({ onDeposit }) => {
  const { balance } = useMetaMask();
  const [showModal, setShowModal] = React.useState(false);
  const [error, setError] = React.useState(false);
  const [value, setValue] = React.useState(false);

  React.useEffect(() => {
    if (showModal === false) setValue(false);
  }, [showModal]);

  const handleModalToggle = React.useCallback(() => {
    setShowModal(!showModal);
  }, [showModal]);

  return (
    <div>
      <Button variant="default" handleClick={handleModalToggle}>
        Deposit
      </Button>
      {showModal && (
        <Modal title="Deposit" handleModalToggle={handleModalToggle}>
          {error && (
            <Alert color="red">
              <span>Not enough balance!</span>
            </Alert>
          )}
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
                  const val = value.replace(/\s/gi, '');
                  if (Number(val) > balance) {
                    setError(true);
                  } else {
                    onDeposit(val);
                    setShowModal(!showModal);
                  }
                }}
              >
                Deposit
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
