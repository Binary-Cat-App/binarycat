import React from 'react';

export const Alert = ({ color = 'red', children = 'Alert Message' }) => {
  return (
    <>
      <div
        className={`text-white px-4 text-sm py-2 border-0 rounded relative mb-4 
          ${color === 'red' && 'bg-red-500'}
          ${color === 'green' && 'bg-green-500'}
          ${color === 'yellow' && 'bg-yellow-500'}`}
      >
        {children}
      </div>
    </>
  );
};
