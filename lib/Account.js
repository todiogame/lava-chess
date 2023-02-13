const LEVEL_CAP = 100;
const LEVEL_EXP_MODIFIER = 1.5;

class Account {
    constructor(username, level, experience) {
        this.username = username;
        this.level = level || 1;
        this.experience = experience || 0;
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
        return Math.floor(1000 * (LEVEL_EXP_MODIFIER ** (this.level - 1)));
    }

    updateHTML() {
        document.querySelector("#level").textContent = this.level;
      
        const experienceBarFill = document.querySelector("#experience-bar-fill");
        let targetWidth = `${(this.experience / this.requiredExperience()) * 100}%`;
      
        // targetWidth = parseFloat(targetWidth.replace("%", "")) / 100;
        console.log(targetWidth)
        experienceBarFill.style.width = targetWidth;
        experienceBarFill.style.transition = `width 1s ease-in-out`;
        setTimeout(function() {
          experienceBarFill.style.width = "0%";
        }, 0);
        setTimeout(function() {
          experienceBarFill.style.width = targetWidth;
        }, 10);
      }
}
module.exports = Account;