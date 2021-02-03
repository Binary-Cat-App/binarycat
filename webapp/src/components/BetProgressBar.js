import React from 'react';

export const BetProgressBar = ({ completed }) => {
  return (
    <div className="progress-bar">
      <span style={{ width: completed + '%' }}></span>
    </div>
  );
};
