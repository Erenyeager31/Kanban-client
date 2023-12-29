import React from 'react'
// import {
//   BrowserRouter,
//   Route,
//   Routes
// } from 'react-router-dom'
import SIGNUP from './Signup'
import OTP_VER from './Otp_ver'
import LOGIN from './Login'

function Auth(props) {
  return (
    <div>
      <div id='kboard'>
        <div className="kboard">Kanban Board</div>
      </div>
      <div className='auth_container'>
        {props.component === 'login' && <LOGIN />}
        {props.component === 'signup' && <SIGNUP />}
        {props.component === 'OTP_VER' && <OTP_VER/>}
      </div>
    </div>
  )
}

export default Auth
