import React, { useState } from 'react';

import Select from 'react-select';

export const SelectButton = ({ options, selectedCurrency }) => {
  const colourStyles = {
    control: (styles) => ({
      ...styles,
      backgroundColor: 'white',
      borderRadius: '32px',
      borderColor: '#4e5471',
      padding: '10px',
    }),
    option: (styles, { data, isDisabled, isFocused, isSelected }) => {
      return {
        ...styles,
        // backgroundColor: isDisabled ? 'red' : 'blue',
        // color: '#FFF',
        cursor: isDisabled ? 'not-allowed' : 'default',
      };
    },
  };

  return (
    <Select
      placeholder={'betting with ' + selectedCurrency}
      styles={colourStyles}
      options={options}
      className="btn-select"
    ></Select>
  );
};

export default SelectButton;
