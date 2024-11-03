import React from 'react'
import { Link } from 'react-router-dom'
import lightPageNotFound from '../imgs/404.png';
import darkPageNotFound from '../imgs/404-dark.png';
import fullLogo from '../imgs/Prep.png';
import darkFullLogo from '../imgs/darkPrep.png';
import { ThemeContext } from '../App';
import { useContext } from 'react';


const PageNotFound = () => {

  let { theme } = useContext(ThemeContext);

  return (
    <section className="h-cover relative p-10 flex flex-col items-center gap-20 text-center">
      <img
        src={theme === 'light' ? darkPageNotFound : lightPageNotFound}
        alt="404 page"
        className="select-none border-2 border-grey w-72 aspect-square object-cover rounded"
      />
      <h1 className="text-4xl font-gelasio leading-7">Page not found</h1>
      <p>
        The page you are loading does not exists. Head to the{' '}
        <Link to="/" className="text-black underline">
          home page
        </Link>
      </p>
      <div className="mt-auto">
        <img
          src={theme === 'light' ? darkFullLogo : fullLogo}
          className="h-8 object-contain block mx-auto select-none"
        />
        <p>Read millions of stories around the world</p>
      </div>
    </section>
  )
}

export default PageNotFound