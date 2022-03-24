import React, { useState } from 'react';

import Select, { components } from 'react-select';

export const SelectButton = ({
  options,
  selectedValue,
  placeholder,
  onChange,
}) => {
  const colourStyles = {
    control: (styles) => ({
      ...styles,
      backgroundColor: 'white',
      borderRadius: '16px',
      border: 'none',
      // selectedBorderColor: '#4cc2c2',
      padding: '10px',
      '&:hover': {
        borderColor: '#f7f7f7',
      },
      innerWidth: 300,
      fontSize: 14,
      cursor: 'pointer',
      paddingTop: 4,
      paddingBottom: 4,
    }),
    option: (styles, { data, isDisabled, isFocused, isSelected }) => {
      return {
        ...styles,
        // backgroundColor: isDisabled ? 'red' : 'blue',
        // color: '#FFF',
        cursor: isDisabled ? 'not-allowed' : 'default',
        color: 'black',
        cursor: 'pointer',
      };
    },
    menu: (provided) => ({
      ...provided,
      zIndex: 11,
      borderRadius: 16,
      paddingTop: 8,
      paddingBottom: 8,
      fontSize: 14,
    }),
    dropdownIndicator: (base) => ({
      ...base,
      color: '#4cc2c2', // Custom colour
    }),
  };

  const { Option } = components;
  const IconOption = (props) => (
    <Option className="" {...props}>
      {/* {
        <div className="row d-inline-flex">
          <div className="col"></div>
          <div className="col"></div>
        </div>
      } */}
      {props.data.icon}
      {props.data.label}
    </Option>
  );

  return (
    <Select
      filterOption={false}
      onChange={onChange}
      components={{ Option: IconOption }}
      placeholder={placeholder}
      styles={colourStyles}
      options={options}
      className="btn-select"
      value={options.filter((option) => option.value === selectedValue)[0]}
      autosize={false}
      theme={(theme) => ({
        ...theme,
        borderRadius: 0,
        colors: {
          ...theme.colors,
          primary25: '#f7f7f7',
          primary: '#f7f7f7',
        },
      })}
    >
      Teste
    </Select>
  );
};

export default SelectButton;
