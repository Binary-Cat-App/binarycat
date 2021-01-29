import React, { useEffect, useState, useRef } from 'react';
import { Bet } from './Bet';
import { Loading } from './Loading';
import { UserArea } from './UserArea';
import useInterval from '@use-it/interval';
import { BetChart } from './Chart';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import { v4 as uuid } from 'uuid';

const exampleData = {
  blockSize: '11,029,235',
  poolTotalUp: '22.46',
  poolTotalDown: '11.01',
  poolSize: '33.47',
  accounts: '100',
  price: '370',
};

const Dashboard = ({ contracts }) => {
  const [isLoading] = useState(false);
  const [betSession, setBetSession] = useState(0);

  const betScrollDiv = useRef(null);

  const [bets, setBets] = useState([
    {
      ...exampleData,
      finalPrice: '384.02',
      initialPrice: '370',
      status: 'finalized',
      id: uuid(),
    },
    {
      ...exampleData,
      initialPrice: '370',
      finalPrice: '',
      status: 'ongoing',
      id: uuid(),
    },

    {
      ...exampleData,
      status: 'open',
      id: uuid(),
    },
  ]);

  useEffect(() => {
    const betDivWidth =
      betScrollDiv.current && betScrollDiv.current.offsetWidth;
    const pixelsToMove = betSession * (betDivWidth / 3);

    betScrollDiv.current.style.transform = `translateX(${-pixelsToMove}px)`;
  }, [betSession]);

  useInterval(() => {
    setBets((prev) => [
      { ...exampleData, status: 'open', id: uuid() },
      ...prev,
    ]);
    setBetSession((prev) => prev + 1);
  }, 10000);

  return isLoading ? (
    <div className="h-64 flex flex-col items-center justify-center">
      <Loading />
    </div>
  ) : (
    <>
      <UserArea />

      <div className="-mx-4 overflow-x-hidden">
        <div
          className="transition-all duration-1000 ease-in-out"
          ref={betScrollDiv}
        >
          <TransitionGroup className="flex justify-end flex-row-reverse">
            {bets.map((bet, index) => (
              <CSSTransition
                key={`${bet.id}`}
                timeout={2000}
                classNames="transition"
              >
                <Bet {...bet} betSession={index} />
              </CSSTransition>
            ))}
          </TransitionGroup>
        </div>
      </div>

      <div className="mt-6">
        <BetChart classAlt="h-64" />
      </div>
    </>
  );
};

export default Dashboard;
