import { createContext, useEffect, useState } from 'react'

import { Navbar } from './components/Navbar'
import { Route, Routes } from 'react-router-dom'
import { UserAuthForm } from './pages/UserAuthForm'
import { lookInSession } from './common/sessions'
import Editor from './components/Editor'
import HomePage from './pages/HomePage'
import Search from './pages/Search'
import PageNotFound from './components/PageNotFound'
import Profile from './pages/Profile'
import BlogPage from './pages/BlogPage'
import SideNav from './components/SideNav'
import ChangedPassword from './pages/ChangedPassword'
import EditProfile from './pages/EditProfile'
import Notifications from './pages/Notifications'
import ManageBlogs from './pages/ManageBlogs'

export const UserContext = createContext({})

export const ThemeContext = createContext({});



function App() {
 
  const [userAuth,setUserAuth]=useState();

  const [theme, setTheme] = useState( 'light');


  useEffect(()=>{

    let userInSession=lookInSession("user");
    let themeInSession = lookInSession('theme');

    userInSession ? setUserAuth(JSON.parse(userInSession)) : setUserAuth({access_token : null})


    if (themeInSession) {
      setTheme(() => {
        document.body.setAttribute('data-theme', themeInSession);

        return themeInSession;
      });
    } else {
      document.body.setAttribute('data-theme', theme);
    }

  },[])

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
    <UserContext.Provider value={{userAuth,setUserAuth}}>
      <Routes>
        <Route path='/editor' element={<Editor />} />
        <Route path='/editor/:blog_id' element={<Editor />} />
      <Route path='/' element={<Navbar />}>
      <Route index element={<HomePage />} />
      <Route path="dashboard" element={<SideNav />}>
              <Route path="blogs" element={<ManageBlogs />} />
              <Route path="notifications" element={<Notifications />} />
            </Route>
      <Route path='settings' element={<SideNav /> } >
      <Route path='edit-profile' element={<EditProfile />} />
      <Route path='change-password' element={ <ChangedPassword />  } />
      </Route>
          <Route path='signin'  element={<UserAuthForm type="sign-in"/> }/>
          <Route path='signup' element={<UserAuthForm type="sign-up" /> } />
          <Route path='search/:query' element={<Search />} />
          <Route path='user/:id' element={ <Profile />} />
          <Route path='blog/:blog_id' element={<BlogPage /> } />
          <Route path='*' element={<PageNotFound /> }/>
      </Route>
    </Routes>
    </UserContext.Provider>
    </ThemeContext.Provider>
  )
}

export default App
