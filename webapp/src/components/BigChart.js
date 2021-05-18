import React from 'react';
import Chart from 'kaktana-react-lightweight-charts';

export const BetChart = ({ classAlt, chart }) => {
  const rest = React.useMemo(() => {
    if (chart) {
      if (chart.length > 0) {
        return { from: chart[0].time, to: chart[chart.length - 1].time };
      }
    }
    return {};
  }, [chart]);

  const options = {
    layout: {
      backgroundColor: '#fff',
      textColor: 'rgba(145, 150, 179, 1)',
      fontSize: 12,
    },
    grid: {
      vertLines: {
        color: 'rgba(223, 225, 233, 1)',
        style: 2,
        visible: true,
      },
      horzLines: {
        color: 'rgba(223, 225, 233, 1)',
        style: 2,
        visible: true,
      },
    },
    crosshair: {
        vertLine: {
            color: 'rgba(78, 84, 113, 1)',
            width: 0.5,
            style: 2,
            visible: true,
            labelVisible: false,
        },
        horzLine: {
            color: 'rgba(78, 84, 113, 1)',
            width: 0.5,
            style: 2,
            visible: true,
            labelVisible: true,
        },
        mode: 1,
    },
    priceScale: {
        borderVisible: false,
    },
    timeScale: {
      rightOffset: 0,
      fixLeftEdge: true,
      barSpacing: 6,
      timeVisible: true,
      secondsVisible: true,
      borderVisible: false,
    },
  };
  const lineSeries = [
    {
      options: {
        color: 'rgba(76, 194, 194, 1)',
        lineWidth: 3,
        crosshairMarkerVisible: true,
        crosshairMarkerRadius: 8,
      },
      data: chart ? chart.map((el) => {
        const utcTimeObj = new Date(el.time * 1000); 
        const timezoneOffset = (utcTimeObj.getTimezoneOffset()*60000)/1000;
        const localTimestamp = el.time-timezoneOffset;
        return { time: localTimestamp, value: el.rate };
      }) : [],
    },
  ];
  return (
    <div
      className={`flex items-center justify-center text-white ${classAlt}`}
    >
      <Chart
        options={options}
        lineSeries={lineSeries}
        autoWidth
        height={190}
      />
    </div>
  );
};
