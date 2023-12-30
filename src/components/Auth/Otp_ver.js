import { React, useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

function Otp_ver() {
  const navigate = useNavigate()

  const [credential, setcredentials] = useState({
    email: "",
    otp: ""
  })

  const [readOnly, setreadOnly] = useState(false)

  const handlechange = (e) => {
    setcredentials({ ...credential, [e.target.name]: e.target.value })
  }

  const sendOTP = async (e) => {
    // alert("hi")
    e.preventDefault();
    const response = await fetch('https://kanban-board-fg6l.onrender.com/api/Auth/sendOTP', {
      method: "POST",
      // credentials: 'include',
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email: credential.email, message: 'OTP sent for email verification' })
    })
    const json = await response.json()
    if (json.success) {
      alert(json.message)
      setreadOnly(true)
    } else {
      alert(json.message)
    }
  }

  const verifyOTP = async (e) => {
    e.preventDefault()

    const response = await axios.post('https://kanban-board-fg6l.onrender.com/api/Auth/verifyOTP', {
      email: credential.email,
      OTP: credential.otp.toString()
    }, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    const json = response.data;
    if (json.success) {
      alert(json.message);
      sessionStorage.setItem('email',credential.email)
      navigate('/signup')
    } else {
      alert(json.message);
    }
  }
  return (
    <div className='otp_container'>
      <div className="otp_right">
        <form action="" className="otp_form">
          <h3 className="heading">VERIFY EMAIL !</h3>
          <div className="email_div">
            <input className='email' type="text" name='email' onChange={handlechange} value={credential.email} placeholder='Email' readOnly={readOnly} />
          </div>
          <div className="email_div">
            <input className='otp' type="text" name='otp' onChange={handlechange} value={credential.otp} placeholder='OTP' readOnly={!readOnly} />
          </div>
          <div className="button_div_otp">
            <button type="button" onClick={sendOTP} disabled={readOnly}>Send OTP</button>
          </div>
          <div className="button_div_otp">
            <button type="button" onClick={verifyOTP} disabled={!readOnly}>VERIFY</button>
          </div>
          <div className="button_login">
            <a href='login'>or LOGIN</a>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Otp_ver