import React, { useState } from 'react';
import { Button } from './Button';
import { ReactComponent as IconSpinner } from '../assets/images/icon-spinner.svg';
import { useStaking } from '../context/StakingContext';

export const StakingSummary = () => {
	const { 
		active,
    	account,
		totalStaked,
		totalRewards,
		walletBalance,
		weiToCurrency,
		stakingObj
	} = useStaking();

	const [effect, setEffect] = useState(false);
	
	const _totalStaked = totalStaked ? weiToCurrency(totalStaked) : 0.00;
	const _totalRewards = totalRewards ? weiToCurrency(totalRewards) : 0.00;
	const _walletBalance = walletBalance ? weiToCurrency(walletBalance) : 0.00;

	const handleWithdraw = async () => {

		setEffect(true);
	
		if ( active && account ) {
			const withdraw = await stakingObj.methods
				.release()
				.send({
					from: account
				});
	
			if( withdraw ) setEffect(false);
		}
	};

	return (
		<>
			<div className="w-1/4 p-4 mx-4 bg-white flex flex-col rounded-3xl shadow-lg">
				<dl className="my-auto">
					<dt className="pb-1 leading-none whitespace-no-wrap text-center">
				  		Total Staked
					</dt>
					<dd className="text-3xl font-black text-green-500 leading-none text-center">
						{_totalStaked.toFixed(2)}
						<span className="block text-2xl">{global.config.tokenName}</span>
					</dd>
				</dl>
			</div>
			<div className="w-1/4 p-4 mx-4 bg-white flex flex-col rounded-3xl shadow-lg">
				<dl className="my-auto">
			    	<dt className="pb-1 leading-none whitespace-no-wrap text-center">
			    		Wallet Balance
			    	</dt>
			    	<dd className="text-3xl font-black text-green-500 leading-none text-center">
						{_walletBalance.toFixed(2)}
						<span className="block text-2xl">{global.config.tokenName}</span>
			    	</dd>
			  	</dl>
			</div>
			<div className="w-1/4 p-4 mx-4 bg-white flex flex-col rounded-3xl shadow-lg">
				<dl className="my-auto">
			    	<dt className="pb-1 leading-none whitespace-no-wrap text-center">
			    		Staked Balance
			    	</dt>
			    	<dd className="text-3xl font-black text-green-500 leading-none text-center">
			      		N/A
			      		<span className="block text-2xl">{global.config.tokenName}</span>
			    	</dd>
			  	</dl>
			</div>
			<div className="w-1/4 p-6 mx-4 bg-white flex flex-col rounded-3xl shadow-lg">
				<dl>
					<dt className="pb-1 leading-none whitespace-no-wrap text-center">
						Total Rewards
					</dt>
					<dd className="text-2xl font-black text-green-500 leading-none text-center">
						{_totalRewards.toFixed(2)} {global.config.currencyName}
					</dd>
				</dl>
				<Button
				    variant="blue"
					outline
					className="mt-4 w-full"
					handleClick={handleWithdraw}
					onAnimationEnd={() => setEffect(false)}
				>
				    Withdraw
					{ effect && <IconSpinner className="spinner animate-spin ml-2 h-5 w-5 text-gray" /> }
				</Button>
			</div>
		</>
	);

};