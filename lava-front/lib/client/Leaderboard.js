class Leaderboard {

    static update() {
        const emojis = ['👑', '🥈', '🥉', '🏅', '🎖️'];
        const config = require("../../config");
        let host = config.EXTERNAL_IP_ADDRESS;
        const isWeb = window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';

        if (isWeb && (host === 'localhost' || host === '127.0.0.1' || !host)) {
            host = 'p01--lava-chess--wd56yy4hk9cj.code.run';
        }

        const protocol = (host === 'localhost' || host === '127.0.0.1') ? 'http' : 'https';
        // If connecting to localhost, we need the port if specified in config, but usually 80/443 for prod.
        // The server.js listens on config.PORT.
        // For Northflank (prod), it's https on standard port.
        // For localhost, it might be http://localhost:80

        let url = `${protocol}://${host}/getLeaderboard`;
        if (host === 'localhost' || host === '127.0.0.1') {
            url = `${protocol}://${host}:${config.PORT}/getLeaderboard`;
        }

        fetch(url)
            .then(response => response.json())
            .then(data => {
                console.log(data)
                const leaderboardData = document.getElementById('leaderboard-data');
                leaderboardData.innerHTML = '';
                data.data.forEach((row, index) => {
                    const tr = document.createElement('tr');
                    const rank = document.createElement('td');
                    rank.textContent = `${emojis[index] || '🔹'} ${index + 1}`;
                    const user = document.createElement('td');
                    user.textContent = row.name.substring(0, 10);
                    const score = document.createElement('td');
                    score.textContent = Math.floor(row.elo);
                    tr.appendChild(rank);
                    tr.appendChild(user);
                    tr.appendChild(score);
                    leaderboardData.appendChild(tr);
                });
            })
            .catch(error => console.error(error));
    }
}
module.exports = Leaderboard;