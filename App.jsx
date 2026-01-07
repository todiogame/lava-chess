import React, { useEffect, useRef } from 'react';
import './public/lava.css'; // Import global styles

function App() {
    const containerRef = useRef(null);

    useEffect(() => {
        // Legacy client initialization
        import('./client.js').then((module) => {
            if (module.initGameClient) {
                module.initGameClient();
            }
        }).catch(err => console.error("Failed to load game client", err));
    }, []);

    return (
        <div id="app-root">
            {/* Main Game Canvas */}
            <div id="game-container" className="game-container" style={{ display: 'none' }}>
                <canvas id="canvas"></canvas>
            </div>

            <div id="container">
                {/* Navigation */}
                <header>
                    <div className="brand">LAVA CHESS</div>
                    <div className="user-controls">
                        <a href="https://discord.gg/y6Gum8MSAN" target="_blank" style={{ color: '#7289da', textDecoration: 'none' }}>Discord</a>
                        <a href="https://www.reddit.com/r/LavaChess/" target="_blank" style={{ color: '#ff4500', textDecoration: 'none' }}>Reddit</a>
                    </div>
                </header>

                {/* Landing Page Content */}
                <div id="landing-page">
                    {/* Hero Section */}
                    <section className="hero">
                        <h1 id="game-title">Lava Chess</h1>
                        <p className="tagline">Forged in Fire. Played on Hexagons.</p>

                        <h2 id="looking" style={{ display: 'none', color: 'var(--primary-magma)' }}>Looking for opponent...</h2>
                        <h1 id="game-result" style={{ display: 'none', color: 'var(--primary-magma)' }}></h1>

                        {/* Guest Nickname Input */}
                        <div id="guest" style={{ marginBottom: '20px' }}>
                            <input type="text" id="nickname" name="nickname" maxLength="10" placeholder="Enter Nickname to Play" style={{
                                textAlign: 'center',
                                fontSize: '1.2rem',
                                padding: '15px',
                                width: '300px',
                                maxWidth: '90%',
                                background: 'rgba(255,255,255,0.05)',
                                border: '1px solid rgba(255,69,0,0.5)',
                                boxShadow: '0 0 10px rgba(0,0,0,0.5)'
                            }} />
                        </div>

                        {/* Main Action Buttons */}
                        <div id="buttons">
                            <button id="quick-match">Play Now</button>
                            <button id="cancel-match" style={{ display: 'none' }}>Cancel Search</button>
                        </div>
                    </section>

                    {/* Bento Grid Content */}
                    <div className="bento-grid">
                        {/* Left Column: Leaderboard */}
                        <div className="card leaderboard-card">
                            <h3 className="card-title">Top Strategists</h3>
                            <div className="leaderboard">
                                <table id="leaderboard">
                                    <thead>
                                        <tr>
                                            <th>#</th>
                                            <th>Name</th>
                                            <th>Elo</th>
                                        </tr>
                                    </thead>
                                    <tbody id="leaderboard-data">
                                        {/* Populated by JS */}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Right Column: Profile & Auth */}
                        <div className="flex-column" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                            {/* Profile Stats */}
                            <div id="logged-in" style={{ display: 'none' }} className="card">
                                <h3 className="card-title">Commander Profile</h3>
                                <h2 id="logged-in-name" style={{ marginBottom: '10px', color: 'white' }}></h2>

                                <div id="account-info">
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                                        <span>Level <span id="level">0</span></span>
                                        <span>Elo <span id="elo">1000</span></span>
                                    </div>
                                    <div id="experience-bar">
                                        <div id="experience-bar-fill"></div>
                                    </div>
                                    <p><span id="message"></span></p>
                                </div>
                            </div>

                            {/* Authentication Forms */}
                            <div id="connection" className="card auth-card">
                                <h3 className="card-title">Authentication</h3>

                                {/* Login Form */}
                                <form action="/login" method="POST" style={{ marginBottom: '20px' }}>
                                    <input type="email" id="email" name="email" placeholder="Email Address" required />
                                    <input type="password" id="password" name="password" placeholder="Password" required />
                                    <input type="submit" value="Log In" />
                                </form>

                                <div style={{ textAlign: 'center', margin: '10px 0', color: '#555' }}>&mdash; OR &mdash;</div>

                                {/* Signup Form */}
                                <form action="/create-account" method="POST">
                                    <input type="text" id="name" name="name" placeholder="Commander Name" required />
                                    <input type="email" id="email_signup" name="email" placeholder="Email Address" required />
                                    <input type="password" id="password_signup" name="password" placeholder="Password" required />

                                    {/* Hidden Fields */}
                                    <input type="hidden" id="levelform" name="levelform" value="0" />
                                    <input type="hidden" id="experienceform" name="experienceform" value="0" />
                                    <input type="hidden" id="eloform" name="eloform" value="0" />

                                    <input type="submit" value="Create Account" style={{ borderColor: 'var(--accent-ember)', color: 'var(--accent-ember)' }} />
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

}

export default App;
