import React from 'react';
import { Button } from './Button';
import { Alert } from './Alert';
import NumberFormat from 'react-number-format';
import { useStaking } from '../context/StakingContext';

export const Unstake = () => {
	const [value, setValue] = React.useState(0);
	const [error, setError] = React.useState(false);

	const { 
		active,
    	account,
		stakedBalance,
		weiToCurrency,
		currencyToWei,
		stakingObj,
    	tokenObj
	} = useStaking();

	const _stakedBalance = stakedBalance ? weiToCurrency(stakedBalance) : 0.00;

	const handleUnstake = async (val) => {
		
		if ( active && account && val > 0 && val <= _stakedBalance ) {

			const amount = currencyToWei(val);

			const unstake = await stakingObj.methods
				.unstake(amount)
				.send({
					from: account
				});
			
			if (unstake) {
				setValue(0);
				setError(false);
			}
		}

	};

	return (
		<>
			<div className="mb-4">
				<h2 className="text-center text-3xl font-medium">Unstake</h2>
				<p className="text-sm text-gray-300 text-center">&nbsp;</p>
			</div>

			{error && (
            	<Alert color="red">
              		<span>Not enough staked balance!</span>
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
					variant="blue"
					size="normal"
					className="w-full py-3 text-xl"
					handleClick={() => {
						if ( value > _stakedBalance ) {
							setError(true);
						} else {
							handleUnstake(value);
						}
					}}
					isDisabled={_stakedBalance === 0 || value === 0}
				>
					Unstake
				</Button>
            </div>
		</>
	);

};