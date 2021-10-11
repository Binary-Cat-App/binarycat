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
    	tokenObj
	} = useStaking();
	
	const _walletBalance = walletBalance ? weiToCurrency(walletBalance) : 0.00;
	const _userAllowance = userAllowance ? weiToCurrency( userAllowance ) : 0.00;

	const handleAllowance = async (val) => {
		
		if ( active && account && val > 0 ) {

			const amount = currencyToWei(val);

			const allowance = await tokenObj.methods
				.approve(staking.address, amount)
				.send({
					from: account
				});
		}

	};

	const handleStake = async (val) => {
		
		if ( active && account && _userAllowance > 0 ) {
			const stake = await stakingObj.methods
				.stake( userAllowance )
				.send({
					from: account
				});

			if ( stake ) {
				setValue(0);
				setError(false);
			}
		}

	};

	return (
		<>
			<div className="mb-4">
				<h2 className="text-center text-3xl font-medium">Stake</h2>
				<p className="text-sm text-gray-300 text-center">Allowance: {_userAllowance.toFixed(2)} {global.config.tokenName}</p>
			</div>

			{error && (
            	<Alert color="red">
              		<span>Not enough balance!</span>
            	</Alert>
          	)}

			<div className="min-w-0 flex items-center mb-8 py-2 px-4 bg-gray-100 rounded">
	            <NumberFormat
	              thousandSeparator=" "
	              decimalSeparator="."
	              decimalScale="2"
	              fixedDecimalScale="2"
	              allowNegative="false"
	              autoFocus
	              className="form-control font-digits text-xl border-0 bg-transparent text-center"
	              value={_userAllowance !== 0 ? _userAllowance : value}
	              onValueChange={(values) => {
					const val = values.formattedValue.replace(/\s/gi, '');
	                setValue(Number(val));
					setError(false);
	              }}
				  disabled={_userAllowance !== 0}
	            />

	            <label htmlFor="stakeAmount" className="ml-2 text-lg flex-shrink-0">
					{global.config.tokenName}
	            </label>
			</div>

			<div className="my-2">
				<Button
					variant="gray"
					size="normal"
					className="w-full py-3 text-xl"
					outline
					handleClick={() => {
						if ( value > _walletBalance ) {
							setError(true);
						} else {
							handleAllowance(value);
						}
					}}
					isDisabled={_userAllowance !== 0 || value === 0}
				>
					Approve
				</Button>
            </div>

            <div className="my-2">
				<Button
					variant="green"
					size="normal"
					className="w-full py-3 text-xl"
					handleClick={() => {
						handleStake();
					}}
					isDisabled={_userAllowance === 0}
				>
					Stake
				</Button>
            </div>
		</>
	);

};