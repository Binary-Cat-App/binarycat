import React from 'react';
import { Loading } from './Loading';

export const Button = ({
  children,
  variant,
  size,
  outline,
  gradient,
  isLoading,
  isDisabled,
  className,
  handleClick = () => console.log('click'),
}) => {
  return (
    <button
      onClick={handleClick}
      className={`btn ${variant ? `btn--${variant}` : ''} ${
        gradient ? `btn--gradient` : ''
      } ${outline ? `btn--outline` : ''} ${isLoading ? 'is-loading' : ''} ${
        className ? className : ''
      }`}
      disabled={isDisabled}
    >
      {isLoading && <Loading />}
      {children}
    </button>
  );
};
