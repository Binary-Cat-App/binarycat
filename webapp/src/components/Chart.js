import React from 'react';
import Chart from 'kaktana-react-lightweight-charts';

export const BetChart = ({ classAlt, chart, status }) => {
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
    handleScroll: false,
    handleScale: false,
    axisPressedMouseMove: false,
    priceScale: {
        borderVisible: false,
    },
    timeScale: {
      rightOffset: 0,
      fixLeftEdge: true,
      lockVisibleTimeRangeOnResize: true,
      shiftVisibleRangeOnNewBar: false,
      timeVisible: true,
      secondsVisible: true,
      borderVisible: false,
    },
  };

  var dataArr = [];
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
        dataArr.push(localTimestamp);
        return { time: localTimestamp, value: el.rate };
      }) : [],
    },
  ];

  const visibleFrom = (dataArr.length > 0) ? Math.min(...dataArr) : 0;
  const visibleTo = (dataArr.length > 0) ? Math.max(...dataArr) : 4102437600;

  return chart.length > 0 ? (
    <div
      className={`flex items-center justify-center text-white ${classAlt}`}
    >
      <Chart
        options={options}
        from={visibleFrom}
        to={visibleTo}
        lineSeries={lineSeries}
        autoWidth
        height={190}
      />
    </div>
  ) : (
    <div
      className={`flex items-center justify-center animate-pulse ${classAlt}`}
    >
      Loading...
    </div>
  ); 
};
