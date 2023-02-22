class Leaderboard {

    static update() {
        const emojis = ['👑', '🥈', '🥉', '🏅', '🎖️'];
        fetch('/getLeaderboard')
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
                    user.textContent = row.name.substring(0,10);
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