import React from 'react';
import { Link } from 'react-router-dom';
import { ReactComponent as IconSupport } from '../assets/images/icon-support.svg';
import { ReactComponent as IconInfo } from '../assets/images/icon-info.svg';
import { ReactComponent as IconFAQ } from '../assets/images/icon-faq.svg';

export const Help = () => {
  return <div>
      <div className="flex lg:-mx-4 flex-col lg:flex-row">
          <div className="w-full lg:w-1/3 p-8 mb-4 lg:mb-0 lg:mx-4 bg-white flex flex-col rounded-3xl">
            <h3 
              className="pb-4 text-3xl font-medium flex justify-center"
              >
                <span 
                  className="flex items-center"
                  >
                    <IconInfo className="icon mr-2" /> Instructions
                </span>
            </h3>
            <div className="flex justify-center">
              <a 
                href="https://medium.com/@BinaryCat/binary-cat-app-walkthrough-2939db9c506e"
                className="btn btn--green"
                target="_blank"
              >
                Click here
              </a>
            </div>
          </div>
          
          <div className="w-full lg:w-1/3 p-8 mb-4 lg:mb-0 lg:mx-4 bg-white flex flex-col rounded-3xl">
            <h3 
              className="pb-4 text-3xl font-medium flex justify-center"
              >
                <span 
                  className="flex items-center"
                  >
                    <IconFAQ className="icon mr-2" /> FAQ
                </span>
            </h3>
            <div className="flex justify-center">
              <Link 
                to="/faq"
                className="btn btn--green"
              >
                Click here
              </Link>
            </div>
          </div>
          
          <div className="w-full lg:w-1/3 p-8 mb-4 lg:mb-0 lg:mx-4 bg-white flex flex-col rounded-3xl">
            <h3 
              className="pb-4 text-3xl font-medium flex justify-center"
              >
                <span 
                  className="flex items-center"
                  >
                    <IconSupport className="icon mr-2" /> Support
                </span>
            </h3>
            <div className="flex justify-center">
              <a 
                href="https://t.me/BinaryCatChat"
                className="btn btn--green"
                target="_blank"
              >
                Click here
              </a>
            </div>
          </div>
        </div>
    </div>;
};
