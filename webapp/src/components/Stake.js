import React from 'react';
import { Button } from './Button';
import { Alert } from './Alert';
import NumberFormat from 'react-number-format';
import { useStaking } from '../context/StakingContext';

export const Stake = () => {
  const [value, setValue] = React.useState(0);
  const [error, setError] = React.useState(false);

  const {
    active,
    account,
    userAllowance,
    walletBalance,
    weiToCurrency,
    currencyToWei,
    stakingObj,
    staking,
    tokenObj,
  } = useStaking();

  const _walletBalance = walletBalance ? weiToCurrency(walletBalance) : 0.0;
  const _userAllowance = userAllowance ? weiToCurrency(userAllowance) : 0.0;

  const allowanceThreshold = 1000000;

  const handleAllowance = async (val) => {
    if (active && account) {
      const amount = currencyToWei(Number.MAX_SAFE_INTEGER);

      const allowance = await tokenObj.methods
        .approve(staking.address, amount)
        .send({
          from: account,
        });
    }
  };

  const handleStake = async (val) => {
    if (
      active &&
      account &&
      _userAllowance > 0 &&
      val > 0 &&
      val <= _userAllowance
    ) {
      const amount = currencyToWei(val);

      const stake = await stakingObj.methods.stake(amount).send({
        from: account,
      });

      if (stake) {
        setValue(0);
        setError(false);
      }
    }
  };

  return (
    <>
      <div className="mb-4">
        <h2 className="text-center text-3xl font-medium">Stake</h2>
      </div>

      {error && (
        <Alert color="red">
          <span>{error}</span>
        </Alert>
      )}

      {_userAllowance < Number.MAX_SAFE_INTEGER - allowanceThreshold && (
        <div className="my-2">
          <Button
            variant="green"
            size="normal"
            className="w-full py-3 text-xl mb-8"
            handleClick={() => {
              handleAllowance(value);
            }}
          >
            Top up your staking allowance
          </Button>
        </div>
      )}

      {_userAllowance !== 0 && (
        <>
          <div className="min-w-0 flex items-center mb-8 py-2 px-4 bg-gray-100 rounded">
            <Button
              variant="gray"
              outline
              className="text-gray-800 font-normal py-1 px-2 border border-gray-400 rounded shadow"
              handleClick={() => {
                setValue(_walletBalance);
              }}
              isDisabled={_walletBalance === 0}
            >
              max
            </Button>

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
                const val = values.formattedValue.replace(/\s/gi, '');
                setValue(Number(val));
                setError(false);
              }}
            />

            <label htmlFor="stakeAmount" className="ml-2 text-lg flex-shrink-0">
              {global.config.tokenName}
            </label>
          </div>

          <div className="my-2">
            <Button
              variant="green"
              size="normal"
              className="w-full py-3 text-xl"
              handleClick={() => {
                if (value > _userAllowance) {
                  setError('Insufficient allowance.');
                } else {
                  handleStake(value);
                }
              }}
              isDisabled={_userAllowance === 0 || value === 0}
            >
              Stake
            </Button>
          </div>
        </>
      )}
    </>
  );
};
