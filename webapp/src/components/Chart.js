import React from 'react';
import Chart from 'kaktana-react-lightweight-charts';

export const BetChart = ({ classAlt, chart }) => {
  const options = {
    layout: {
      backgroundColor: '#fff',
      textColor: 'rgba(33, 56, 77, 1)',
      borderRadius: '20px',
      overflow: 'hidden',
    },
    grid: {
      vertLines: {
        color: 'rgba(197, 203, 206, 0.7)',
      },
      horzLines: {
        color: 'rgba(197, 203, 206, 0.7)',
      },
    },
    timeScale: {
      timeVisible: true,
      secondsVisible: false,
    },
  };
  const lineSeries = [
    {
      data: chart
        ? chart.map((el) => {
            return { time: el.time, value: el.rate };
          })
        : [],
    },
  ];
  return (
    <div
      className={`bg-gray-100 rounded-3xl flex items-center justify-center text-white ${classAlt}`}
    >
      <Chart options={options} lineSeries={lineSeries} autoWidth height={190} />
    </div>
  );
};
