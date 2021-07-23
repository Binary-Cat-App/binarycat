import React from 'react';
import NumberFormat from 'react-number-format';
import { Button } from './Button';
import { Modal } from './Modal';
import { Alert } from './Alert';

export const ModalWithdraw = ({ onWithdraw, balance }) => {
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
      <Button variant="blue" className="ml-4" handleClick={handleModalToggle}>
        Withdraw
      </Button>
      {showModal && (
        <Modal title="Withdraw" handleModalToggle={handleModalToggle}>
          <div className="mb-4 pb-2 text-lg">
            Your Current Balance is <strong className="text-pink-500">{balance} {global.config.currencyName}</strong>
          </div>
          {error && <Alert color="red">Not enough balance!</Alert>}
          <div className="min-w-0 flex items-center mb-4 py-2 px-4 bg-gray-100 rounded">
            
            <Button 
              handleClick={() => {
                setValue(balance);
              }}
              className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-normal py-1 px-2 border border-gray-400 rounded shadow outline-none"
            >
              max
            </Button>

            <NumberFormat
              thousandSeparator=" "
              decimalSeparator="."
              fixedDecimalScale="false"
              allowNegative="false"
              autoFocus
              className="form-control font-digits text-xl border-0 bg-transparent text-center"
              value={value}
              onValueChange={(values) => {
                setValue(values.formattedValue);
              }}
            />

            <label htmlFor="betAmount" className="ml-2 text-lg flex-shrink-0">
              {global.config.currencyName}
            </label>

          </div>
          <div className="flex items-center -mx-2">
            <div className="px-2 flex-grow">
              <Button
                variant="gray"
                className="w-full"
                outline
                handleClick={handleModalToggle}
              >
                Cancel
              </Button>
            </div>
            <div className="px-2 flex-grow">
              <Button
                variant="blue"
                className="w-full"
                handleClick={() => {
                  const val = value.toString().replace(/\s/gi, '');
                  const _val = Number( val );

                  if( _val > 0 ) {
                    if ( _val > balance ) {
                      setError(true);
                    } else {
                      onWithdraw(val);
                      setShowModal(!showModal);
                    }
                  }
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
