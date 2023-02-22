const strings = require("./languages")

const LEVEL_CAP = 5;
// Base Elo rating for new players
const BASE_RATING = 1000;

class UserAccount {
    constructor(userInfo) {
        console.log("UserAccount")
        console.log(userInfo)
        this.username = userInfo.name;
        this.level = userInfo.level || 1;
        this.experience = userInfo.experience || 0;
        this.elo = userInfo.elo || BASE_RATING;
        this.token = userInfo.token;

        this.updateHTML()

    }

    addExperience(exp) {
        this.experience += exp;
        while (this.experience >= this.requiredExperience()) {
            this.levelUp();
        }
        this.updateHTML()
    }

    levelUp() {
        if (this.experience > this.requiredExperience())
            this.experience = this.experience - this.requiredExperience()
        else this.experience = 0;

        if (this.level < LEVEL_CAP) this.level++;
        console.log(`${this.username} has leveled up to level ${this.level}!`);
        this.updateHTML()
    }

    requiredExperience() {
        return Math.floor(1000 + (this.level) * 100);
    }

    setElo(elo) {
        this.elo = elo;
        this.updateHTML()
    }

    updateHTML() {
        document.querySelector("#level").textContent = this.level;
        document.querySelector("#elo").textContent = Math.floor(this.elo);
        document.querySelector("#levelform").value = this.level;
        document.querySelector("#experienceform").value = this.experience;
        document.querySelector("#eloform").value = this.elo;

        if (this.message) document.querySelector("#message").innerHTML = this.message;
        const nameInput = document.getElementById("nickname");
        // Set the stored name as the value of the name input field

        document.getElementById("connection").style.display = "none";
        document.getElementById("guest").style.display = "none";
        document.getElementById("logged-in-name").textContent = this.username

        const experienceBarFill = document.querySelector("#experience-bar-fill");
        let targetWidth = `${(this.experience / this.requiredExperience()) * 100}%`;

        // targetWidth = parseFloat(targetWidth.replace("%", "")) / 100;
        // console.log(targetWidth)
        experienceBarFill.style.width = targetWidth;
        experienceBarFill.style.transition = `width 1s ease-in-out`;
        setTimeout(function () {
            experienceBarFill.style.width = "0%";
        }, 0);
        setTimeout(function () {
            experienceBarFill.style.width = targetWidth;
        }, 10);
    }

}
module.exports = UserAccount;