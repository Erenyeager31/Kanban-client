import React, { useState,useContext } from 'react'
import '../../static/Auth.css'
import { WSContext } from '../../context/Workspace'
import { useNavigate } from 'react-router-dom'

export default function Login() {
    const navigate = useNavigate()

    //! context
    //eslint-disable-next-line
    const {isLoggedin,setLoggedIn} = useContext(WSContext)

    const [credential, setcredentials] = useState({
        email: "",
        password: ""
    })

    const handlechange = (e) => {
        setcredentials({ ...credential, [e.target.name]: e.target.value })
    }

    const AttemptLogin = async (e) => {
        // alert("hi")
        e.preventDefault();

        const response = await fetch('https://kanban-board-fg6l.onrender.com/api/Auth/loginUser', {
            method: "POST",
            credentials:'include',
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ email: credential.email, password: credential.password })
        })

        const json = await response.json()

        if (json.success) {
            alert(json.message)
            sessionStorage.setItem('username',json.user.name)
            sessionStorage.setItem('email',json.user.email)
            sessionStorage.setItem("isLoggedIn",true)
            setLoggedIn(true)
            navigate("/ws_dashboard")
        }else{
            alert(json.message)
        }
    }

    return (
        <div className='login_container'>
            <div className="login_right">
                <form action="" className="login_form">
                    <h3 className="heading">LOGIN FORM</h3>
                    <div className="email_div">
                        <input type="text" name='email' onChange={handlechange} value={credential.email} placeholder='Email'/>
                    </div>
                    <div className="pass_div">
                        <input type="password" name='password' onChange={handlechange} value={credential.password} placeholder='Password' required />

                    </div>
                    <div className="button_div_login">
                        <button type="button" onClick={AttemptLogin}>LOGIN</button>
                    </div>
                    <div className="fgt_password">forgot password?</div>
                    {/* <div className="round_or">
                        <div className="up_circle"></div>
                        <div className="or_text">OR</div>
                        <div className="low_circle"></div>
                    </div> */}
                </form>
                <div className="button_div_signup">
                    <a href='/signup' type="button">SIGN UP</a>
                </div>
            </div>
        </div>
    )
}
