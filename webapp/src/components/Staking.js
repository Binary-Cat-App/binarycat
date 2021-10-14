import React, { useEffect, useState, useRef } from 'react';
import { StakingSummary } from './StakingSummary';
import { Stake } from './Stake';
import { Unstake } from './Unstake';
import { useStaking } from '../context/StakingContext';

export const Staking = () => {

	const {
		currentBlock,
		account,
		weiToCurrency,
		currencyToWei,
		web3Eth,
		web3Utils
	} = useStaking();

	return (

		<>
			<div className="flex -mx-4 mb-8">
				<StakingSummary />
			</div>

			<div className="flex -mx-4">
				<div className="w-1/2 p-8 mx-4 bg-white flex flex-col rounded-3xl">
					<Stake />
				</div>
				
				<div className="w-1/2 p-8 mx-4 bg-white flex flex-col rounded-3xl">
					<Unstake />
				</div>
			</div>
		</>

	);
};