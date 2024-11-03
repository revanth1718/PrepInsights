import React, { useContext, useEffect, useState } from 'react'
import lightlogo from '../imgs/Prep.png';
import darklogo from '../imgs/darkPrep.png';

import { Link,Outlet, useNavigate } from 'react-router-dom'
import { ThemeContext, UserContext } from '../App'
import UserNavigationPanel from './UserNavigationPanel'
import axios from 'axios'


export const Navbar = () => {
  const [searchBoxVisibility, setSearchBoxVisibility] = useState(false);
  const [userNavPanel, setUserNavPanel] = useState(false);

    let { theme, setTheme } = useContext(ThemeContext);


    let {userAuth,
      
      setUserAuth
    }=useContext(UserContext)

    const access_token = userAuth?.access_token;
    const profile_img = userAuth?.profile_img;
    const new_notification_available = userAuth?.new_notification_available

    const navigate=useNavigate();
 
    const handleNavPanel =()=>{
      setUserNavPanel(currentVal=>!currentVal)
    }

    const handleBlur =()=>{
      setTimeout(()=>{
        setUserNavPanel(false)
      },300)
    }

    const changeTheme = () => {
      let newTheme = theme == 'light' ? 'dark' : 'light';
  
      setTheme(newTheme);
      document.body.setAttribute('data-theme', newTheme);
      storeInSession('theme', newTheme);
    };

    const handleSearch=(e)=>{
      let query=e.target.value
      if(e.keyCode==13&&query.length){
        navigate(`/search/${query}`)
      }
    }
    useEffect(() => {
      if (access_token) {
        axios
          .get(import.meta.env.VITE_SERVER_DOMAIN + '/profile/new-notification', {
            headers: {
              Authorization: `Bearer ${access_token}`,
            },
          })
          .then(({ data }) => {
            setUserAuth({ ...userAuth, ...data }); // this will set new notifiaction in d local storage
          })
          .catch((err) => {
            console.log(err);
          });
      }
    }, [access_token]);

  return (
    <>
    <nav className='navbar'>
        <Link to="/" className='flex-none w-20'>
        <img src={theme === 'light' ? darklogo : lightlogo} />
        </Link>

        <div
          className={`absolute bg-white w-full left-0 
      top-full mt-0 border-b border-grey py-4 px-[5vw] md:border-0
      md:block md:relative md:inset-0 md:p-0 md:w-auto md:show ${
        searchBoxVisibility ? 'show' : 'hide'
      }`}
        >
          <input
            type="text"
            placeholder="Search"
            className="w-full md:w-auto bg-grey p-4 pl-6 md:pl-12 pr-[12px] md:pr-[6px] rounded-full placeholder:text-dark-grey"
            onKeyDown={handleSearch}
          />
          <i className="fi fi-rr-search absolute right-[10%] md:pointer-events-none md:left-5 top-1/2 -translate-y-1/2 text-xl text-dark-grey"></i>
        </div>
        <div className="flex items-center gap-3 md:gap-6 ml-auto">
          <button
            className="md:hidden bg-grey w-12 h-12 rounded-full 
        flex items-center justify-center"
            onClick={() => setSearchBoxVisibility((currentVal) => !currentVal)}
          >
            <i className="fi fi-rr-search text-xl"></i>
          </button>
          <Link to={'editor'} className="hidden md:flex gap-2 link">
            <i className="fi fi-rr-file-edit"></i>
            <p>Write</p>
          </Link>
          <button
            className="bg-grey w-12 h-12 rounded-full 
        flex items-center justify-center"
            onClick={changeTheme}
          >
            <i
              className={`fi ${
                theme === 'light' ? 'fi-rr-moon-stars' : 'fi-rr-sun'
              } text-2xl block mt-1`}
            ></i>
          </button>
          {access_token ? (
            <>
              <Link to="/dashboard/notifications">
                <button className="w-12 h-12 rounded-full bg-grey relative hover:bg-black/10">
                  <i className="fi fi-rr-bell text-2xl block mt-1"></i>
                  {new_notification_available ? (
                    <span className="bg-red w-3 h-3 rounded-full absolute z-10 top-2 right-2"></span>
                  ) : (
                    ''
                  )}
                </button>
              </Link>
              <div
                onClick={handleNavPanel}
                onBlur={handleBlur}
                className="relative"
              >
                <button className="w-12 h-12 mt-1">
                  {/* profile image is from the database */}
                  <img
                    src={profile_img}
                    className="w-full h-full object-cover rounded-full"
                  />
                </button>
                {userNavPanel ? <UserNavigationPanel /> : ''}
              </div>
            </>
          ) : (
            <>
              <Link to={'/signin'} className="btn-dark py-2">
                Sign In
              </Link>
              <Link to={'/signup'} className="btn-light py-2 hidden md:block">
                Sign Up
              </Link>
            </>
          )}
        </div>
      </nav>
      <Outlet />
    </>
  );
}
