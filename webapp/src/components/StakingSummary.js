import React from 'react';
import { Button } from './Button';

export const StakingSummary = () => {

	return (
		<>
			<div className="w-1/4 p-4 mx-4 bg-white flex flex-col rounded-3xl shadow-lg">
				<dl className="my-auto">
					<dt className="pb-1 leading-none whitespace-no-wrap text-center">
				  		Total Staked
					</dt>
					<dd className="text-3xl font-black text-green-500 leading-none text-center">
				  		100,000.00
				  		<span className="block text-2xl">KITTY</span>
					</dd>
				</dl>
			</div>
			<div className="w-1/4 p-4 mx-4 bg-white flex flex-col rounded-3xl shadow-lg">
				<dl className="my-auto">
			    	<dt className="pb-1 leading-none whitespace-no-wrap text-center">
			    		Wallet Balance
			    	</dt>
			    	<dd className="text-3xl font-black text-green-500 leading-none text-center">
						200.00
						<span className="block text-2xl">KITTY</span>		      		
			    	</dd>
			  	</dl>
			</div>
			<div className="w-1/4 p-4 mx-4 bg-white flex flex-col rounded-3xl shadow-lg">
				<dl className="my-auto">
			    	<dt className="pb-1 leading-none whitespace-no-wrap text-center">
			    		Staked Balance
			    	</dt>
			    	<dd className="text-3xl font-black text-green-500 leading-none text-center">
			      		5000.00
			      		<span className="block text-2xl">KITTY</span>
			    	</dd>
			  	</dl>
			</div>
			<div className="w-1/4 p-6 mx-4 bg-white flex flex-col rounded-3xl shadow-lg">
				<dl>
					<dt className="pb-1 leading-none whitespace-no-wrap text-center">
						Total Rewards
					</dt>
					<dd className="text-2xl font-black text-green-500 leading-none text-center">
				  		4.5 BNB
					</dd>
				</dl>
				<Button
				    variant="blue"
					outline
					className="mt-4 w-full"
				>
				    Withdraw
				</Button>
			</div>
		</>
	);

};