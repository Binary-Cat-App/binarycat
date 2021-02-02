import React from 'react';

export const Modal = ({ children, title, handleModalToggle }) => {
  return (
    <>
      <>
        <div className="justify-center items-center flex overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none pointer-events-none">
          <div className="relative w-auto my-6 mx-auto max-w-3xl pointer-events-auto">
            {/*content*/}
            <div className="border-0 rounded shadow-lg relative flex flex-col w-full bg-white outline-none focus:outline-none">
              {/*header*/}

              <div className="flex items-start justify-between p-5 rounded-t">
                {title && <h3 className="text-2xl font-medium">{title}</h3>}

                <button
                  className="p-1 ml-auto bg-transparent border-0 text-gray-900 opacity-5 text-3xl leading-none outline-none focus:outline-none"
                  onClick={handleModalToggle}
                >
                  <span className=" h-6 w-6 text-2xl block outline-none focus:outline-none">
                    ×
                  </span>
                </button>
              </div>
              {/*body*/}
              <div className="relative p-6 flex-auto">{children}</div>
            </div>
          </div>
        </div>
        <div
          className="opacity-50 fixed inset-0 z-40 bg-gray-900"
          onClick={handleModalToggle}
        />
      </>
    </>
  );
};
