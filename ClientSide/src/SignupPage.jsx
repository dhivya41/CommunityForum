// SignupPage.js
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Loginpage.css';

function SignupPage() {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();

    const handleSignUp = async () => {
        try {
            const response = await fetch("http://localhost:4500/signup", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ username, email, password }),
            });
            if (response.ok) {
                const data = await response.json();
                localStorage.setItem("username", data.username); 
                navigate("/login");
            } else {
                const data = await response.json();
                alert(data.error);
            }
        } catch (error) {
            console.error("Error:", error);
            alert("An error occurred while trying to sign up.");
        }
    };

    return (
        <div className="login-page">
            <div className="Backgndcontainer">
                <div className='log'>
                    <h1>Sign Up</h1>
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
                    <input  className="ipt"
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                /></div>
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
                    <button  className="but"type="button" onClick={handleSignUp}>Sign Up</button>
            </form>
            <div className="link-container">
                Already have an account? <Link to="/login">Log in</Link>
            </div>
            </div>
        </div>
    );
}

export default SignupPage;
