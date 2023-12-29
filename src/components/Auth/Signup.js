import '../../static/Auth.css'
//eslint-disable-next-line
import { React, useState, useContext } from 'react';

export default function Signup() {
  const [credential, setcredentials] = useState({
    username: "",
    email: sessionStorage.getItem("email"),
    password: ""
  })

  const handlechange = (e) => {
    setcredentials({ ...credential, [e.target.name]: e.target.value })
  }

  const AttemptLogin = async (e) => {
    // alert("hi")
    e.preventDefault();

    const response = await fetch('http://localhost:5000/api/Auth/createUser', {
      method: "POST",
      credentials: 'include',
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name: credential.username, email: credential.email, password: credential.password })
    })

    const json = await response.json()

    if (json.success) {
      alert(json.message)
      sessionStorage.setItem('username', json.user.name)
      sessionStorage.setItem('email', json.user.email)
      window.location.assign("/ws_dashboard")
    } else {
      alert(json.message)
    }
  }
  return (
    <div className='login_container'>
      <div className="login_right">
        <form action="" className="login_form">
          <h3 className="heading">SIGNUP FORM</h3>
          <div className="username_div">
            <input type="text" name='username' onChange={handlechange} value={credential.username} placeholder='Username' />
          </div>
          <div className="email_div">
            <input type="text" name='email' onChange={handlechange} value={credential.email} placeholder='Email' readOnly />
          </div>
          <div className="pass_div">
            <input type="password" name='password' onChange={handlechange} value={credential.password} placeholder='Password' required />
          </div>
          <div className="button_div_login">
            <button type="button" onClick={AttemptLogin}>SIGNUP</button>
          </div>
          <div className="fgt_password">forgot password?</div>
          {/* <div className="round_or">
                <div className="up_circle"></div>
                <div className="or_text">OR</div>
                <div className="low_circle"></div>
            </div> */}
        </form>
        <div className="button_div_signup">
          <a href='/login' type="button">LOGIN</a>
        </div>
      </div>
    </div>
  )
}