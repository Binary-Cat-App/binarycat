import React from 'react';

export const DismissableAlert = ({ children = 'Alert Message', name }) => {

    const dismissStorage = (!localStorage.getItem(name) || localStorage.getItem(name) === 'false') ? false : true;
    const [dismiss, setDismiss] = React.useState( dismissStorage );

    return dismiss === false ? (
        <>
            <div 
                className={`
                    flex
                    items-center
                    flex-row
                    px-4 py-3 
                    mt-4 mb-4
                    border
                    border-gray-100
                    rounded 
                `}
                role="alert">
                <div className="flex-grow">
                    {children}
                </div>
                <span 
                    className="ml-2 w-8"
                    onClick={() => {
                        localStorage.setItem(name, true);
                        setDismiss(true);
                    }}
                    >
                    <svg 
                        className={`
                            fill-current  
                            w-8
                        `} 
                        role="button" 
                        xmlns="http://www.w3.org/2000/svg" 
                        viewBox="0 0 20 20"><title>Close</title><path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z"/>
                    </svg>
                </span>
            </div>
        </>
    ) : false;
};