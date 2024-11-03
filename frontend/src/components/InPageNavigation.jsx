import React, { useEffect, useRef, useState } from 'react';

const InPageNavigation = ({ routes, defaultHidden = [], defaultActiveIndex = 0, children }) => {
  const activeTabLineRef = useRef();
  const activeTab = useRef();
  const [inPageNavIndex, setInPageNavIndex] = useState(defaultActiveIndex);
  
  let [isResizeEventAdded, setIsResizeAdded] = useState(false);

  let [width,setWidth]=useState(window.innerWidth)

  const changePageState = (btn, i) => {
    const { offsetWidth, offsetLeft } = btn;
    activeTabLineRef.current.style.width = offsetWidth + 'px';
    activeTabLineRef.current.style.left = offsetLeft + 'px';

    setInPageNavIndex(i);
  };

  useEffect(() => {
    if (width > 768 && inPageNavIndex != defaultActiveIndex) {
      changePageState(activeTab.current, defaultActiveIndex); //d state will be on first index even without clicking it
    }

    if (!isResizeEventAdded) {
      window.addEventListener('resize', () => {
        if (!isResizeEventAdded) {
          setIsResizeAdded(true);
        }

        setWidth(window.innerWidth);
      });
    }

  }, [width]);

  return (
    <>
      <div className="relative mb-8 bg-white border-b border-grey flex flex-nowrap overflow-x-auto">
        {routes.map((route, i) => {
          return (
            <button
              ref={i === defaultActiveIndex ? activeTab : null}
              key={i}
              className={
                "p-4 px-5 capitalize " +
                (inPageNavIndex === i ? "text-black" : "text-dark-grey") +
                (defaultHidden.includes(route) ? " md:hidden" : "")
              }
              onClick={(e) => changePageState(e.target, i)}
            >
              {route}
            </button>
          );
        })}
        <hr ref={activeTabLineRef} className="absolute bottom-0 duration-300 border-drak-grey" />
      </div>
      {Array.isArray(children) ? children[inPageNavIndex] : children}
    </>
  );
};

export default InPageNavigation;
