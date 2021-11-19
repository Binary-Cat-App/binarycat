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
			<div className="flex -mx-2 lg:-mx-4 mb-4 lg:mb-8 flex-wrap lg:flex-no-wrap">
				<StakingSummary />
			</div>

			<div className="flex lg:-mx-4 flex-col lg:flex-row">
				<div className="w-full lg:w-1/2 mb-4 lg:mb-0 p-8 lg:mx-4 bg-white flex flex-col rounded-3xl">
					<Stake />
				</div>
				
				<div className="w-full lg:w-1/2 mb-4 lg:mb-0 p-8 lg:mx-4 bg-white flex flex-col rounded-3xl">
					<Unstake />
				</div>
			</div>
		</>

	);
};