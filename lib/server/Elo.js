class Elo {
    // Base Elo rating for new players
    static BASE_RATING = 1000;

    // K factor to control the rate of change in ratings
    static K_FACTOR = 32;
    static SENSITIVITY = 400;

    // Calculates the expected win probability for player A
    static expectedWinProbability(playerARating, playerBRating) {
        return 1 / (1 + Math.pow(10, (playerBRating - playerARating) / Elo.SENSITIVITY));
    }

    // Calculates the new Elo ratings for the two players
    static updateEloRatings(playerARating, playerBRating, playerAWon) {
        console.log(playerARating, playerBRating, playerAWon)
        const expectedA = Elo.expectedWinProbability(playerARating, playerBRating);
        const expectedB = 1 - expectedA;
        const actualA = playerAWon ? 1 : 0;

        const newARating = playerARating + Elo.K_FACTOR * (actualA - expectedA);
        const newBRating = playerBRating + Elo.K_FACTOR * ((1 - actualA) - expectedB);

        return { playerA: newARating, playerB: newBRating };
    }
}

module.exports = Elo;