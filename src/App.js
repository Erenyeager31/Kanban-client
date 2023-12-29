import './App.css';
// import Board from './components/Kanban_board'
// import SIGNUP from './components/Auth/Signup'
// import OTP_VER from './components/Auth/Otp_ver'
// import Login from './components/Auth/Login';
import Auth from './components/Auth/Auth';
import DASHBOARD from './components/dashboard/Dashboard';
import axios from 'axios'
import { WSContext } from './context/Workspace';
import {
  BrowserRouter,
  Route,
  Routes
} from 'react-router-dom'
import { useState } from 'react';
import Kanban_board from './components/Kanban_board';

function App() {

  const [ws_id,setWs_id] = useState(sessionStorage.getItem("ws_id"))
  const [isLoggedin,setLoggedIn] = useState(sessionStorage.getItem("isLoggedIn"))

  axios.defaults.baseURL = 'http://localhost:5000/api/';
  return (
    //! this will set the state to be accessible by any componenets
    <WSContext.Provider value={{ws_id,setWs_id,isLoggedin,setLoggedIn}}>
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path='' element={
            // <Auth component="login" />
            <Auth component="OTP_VER"/>
          }>
          </Route>
          
          <Route path='https://kanban-board-fg6l.onrender.com/login' element={
            <Auth component="login" />
          }>
          </Route>

          <Route path='/signup' element={
            <Auth component="signup" />
          }>
          </Route>

          <Route path='/ws_dashboard' element={
            isLoggedin?(<DASHBOARD/>):(<Auth component="login" />)
          }>
          </Route>

          <Route path='/board' element={
            // <Kanban_board/>
            //eslint-disable-next-line
            isLoggedin?(<Kanban_board/>):(<Auth component="login" />)
          }>
          </Route>
        </Routes>
      </BrowserRouter>
    </div>
    </WSContext.Provider>
  );
}

export default App;
