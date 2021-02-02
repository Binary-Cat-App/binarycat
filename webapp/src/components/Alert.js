import React from 'react';

export const Alert = ({ color = 'red', children = 'Alert Message' }) => {
  return (
    <>
      <div
        className={
          'text-white px-4 text-sm py-2 border-0 rounded relative mb-4 bg-' +
          color +
          '-500'
        }
      >
        {children}
      </div>
    </>
  );
};
