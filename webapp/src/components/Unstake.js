import React from 'react';
import { Button } from './Button';
import NumberFormat from 'react-number-format';

export const Unstake = () => {

	return (
		<>
			<div className="mb-4">
				<h2 className="text-center text-3xl font-medium">Unstake</h2>
				<p className="text-sm text-gray-300 text-center">&nbsp;</p>
			</div>

			<div className="min-w-0 flex items-center mb-8 py-2 px-4 bg-gray-100 rounded">
	            <NumberFormat
	              thousandSeparator=" "
	              decimalSeparator="."
	              decimalScale="2"
	              fixedDecimalScale="2"
	              allowNegative="false"
	              autoFocus
	              className="form-control font-digits text-xl border-0 bg-transparent text-center"
	              value="0"
	              onValueChange={(values) => {
	                //setValue(values.formattedValue);
	              }}
	            />

	            <label htmlFor="stakeAmount" className="ml-2 text-lg flex-shrink-0">
	              KITTY
	            </label>
			</div>

            <div className="my-2">
				<Button
					variant="blue"
					size="normal"
					className="w-full py-3 text-xl"
				>
					Unstake
				</Button>
            </div>
		</>
	);

};