import React, { useEffect, useState, useRef } from 'react';
import { StakingSummary } from './StakingSummary';
import { Stake } from './Stake';
import { Unstake } from './Unstake';

export const Staking = () => {
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