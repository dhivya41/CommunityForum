import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import './Layout.css';  // CSS for the layout

const Layout = () => {
    return (
        <div className="layout">
            <header className="forum-header">
                <div className="forum-header-left">
                    <h1>C-Forum</h1>
                </div>
                <div className="forum-header-center">
                    <div className="search-bar">
                        <input type="text" placeholder="Search for Topics" />
                        <button>
                            <span role="img" aria-label="search">🔍</span>
                        </button>
                    </div>
                </div>
                <div className="forum-header-right">
                    <Link to="/login">Login</Link>
                    <Link to="/signup">Sign Up</Link>
                    <div className="profile-icon">👤</div>
                </div>
            </header>
            <aside className="forum-sidebar">
                <nav>
                    <ul>
                        <li><Link to="/">Home</Link></li>
                        <li><Link to="/explore">Explore Topics</Link></li>
                        <li><Link to="/chat">Chats</Link></li>
                        <li>My Qns</li>
                    </ul>
                </nav>
            </aside>
            <main className="forum-main">
                <Outlet />
            </main>
        </div>
    );
};

export default Layout;
