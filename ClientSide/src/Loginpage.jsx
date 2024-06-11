import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Loginpage.css';
import backpage from './updforum login bk img.gif';

function Loginpage() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();

    const handleLogIn = async () => {
        try {
            const response = await fetch("http://localhost:4500/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ username, password }),
            });
            if (response.ok) {
                const data = await response.json();
                localStorage.setItem("token", data.token);
                localStorage.setItem("username", data.username); // Store username in local storage
                navigate("/"); 
            } else {
                const data = await response.json();
                alert(data.error);
            }
        } catch (error) {
            console.error("Error:", error);
        }
    };

    return (
        <div className="login-page">
            <div className="Backgndcontainer">
                <div className='log'>
                    <h1>Login</h1>
                </div>
                <form className="login-form">
                    <div className="login">
                        <input
                            className="ipt"
                            type="text"
                            id="username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Enter your username"
                        />
                    </div>
                    <div className="login">
                        <input
                            className="ipt"
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter your password"
                        />
                    </div>
                    <button className="but" type="button" onClick={handleLogIn}>
                        Sign In
                    </button>
                </form>
                <div className="link-container">
                    Don't have an account? <Link to="/signup">Sign up</Link>
                </div>
            </div>
        </div>
    );
}

export default Loginpage;