const c = require("../const");

function displayProfiles(me, enemy) {
  let urname = me.nickname ? me.nickname : "You";
  let hisname = enemy.nickname ? enemy.nickname : "Enemy";
  document.getElementsByClassName("profiles")[0].textContent = urname;
  document.getElementsByClassName("profiles")[0].style.color = TEAM;
  document.getElementsByClassName("profiles")[1].textContent = hisname;
  document.getElementsByClassName("profiles")[1].style.color =
    TEAM == c.CONSTANTS.TEAM_BLUE
      ? c.CONSTANTS.TEAM_RED
      : c.CONSTANTS.TEAM_BLUE;
}

function displayCharacterHUD(player) {
  if (player) {
    document.getElementById("character-hud-container").style.display = "grid";
    document.getElementById("pick-hud-container").style.display = "none";
    document.getElementById("team").textContent =
      TEAM == player.entity.team ? "Your turn" : "Enemy's turn";
    document.getElementById("team").style.color = player.entity.team;
    document.getElementById("name").textContent = player.entity.name;
    document.getElementById(
      "current-hp-text",
    ).textContent = `HP: ${player.entity.currentHP}/${player.entity.maxHP}`;
    document.getElementById("hp-value").style.width = `${
      (player.entity.currentHP / player.entity.maxHP) * 100
    }%`;
    document.getElementById(
      "move-cooldown",
    ).textContent = `${player.movePoint} point`;

    for (let i = 0; i < 3; i++) {
      let spell = player.spells[i];
      let button = document.getElementById(`spell-${i}`);
      if (spell) {
        button.style.display = "inline-block";
        button.getElementsByClassName("content")[0].textContent =
          `${spell.name} ` +
          (spell.cooldown
            ? `${"CD: " + (spell.currentCD > 0 ? spell.currentCD + "/" : "")} ${
                spell.cooldown
              }`
            : ``);
        button.getElementsByClassName("tooltip")[0].textContent =
          spell.description ? `${spell.description}` : "";
        button.setAttribute("data-spell", spell.name);
        if (
          spell.currentCD > 0 ||
          spell.passive ||
          (player.entity.auras.length &&
            player.entity.auras.some((a) => a.name == "silence"))
        ) {
          button.classList.add("disabled");
          button.setAttribute("disabled", true);
        } else {
          button.classList.remove("disabled");
          button.removeAttribute("disabled");
        }
      } else {
        button.style.display = "none";
      }
    }
    let moveButton = document.getElementById(`move`);
    if (player.movePoint <= 0) {
      moveButton.classList.add("disabled");
      moveButton.setAttribute("disabled", true);
    } else {
      moveButton.classList.remove("disabled");
      moveButton.removeAttribute("disabled");
    }

    if (player.isSummoned) {
      document.getElementById("rise-lava").style.display = "none";
      document.getElementById("pass-turn").style.display = "block";
      //grey out button if summon in the other team
      if (player.entity.team == TEAM) {
        document.getElementById("pass-turn").classList.remove("disabled");
        document.getElementById("pass-turn").removeAttribute("disabled");
      } else {
        document.getElementById("pass-turn").setAttribute("disabled", true);
        document.getElementById("pass-turn").classList.add("disabled");
      }
    } else {
      document.getElementById("rise-lava").style.display = "block";
      document.getElementById("pass-turn").style.display = "none"; //comment this line to debug pass
    }
  }
  displayTimeline(player);
}

const displayTimeline = (currentP) => {
  const playerHud = document.querySelector("#timeline");
  let playerList = "";

  PLAYERS.forEach((p) => {
    if (!p.dead)
      playerList += `<p  ${p == currentP ? `class="highlight"` : ``}>${
        p.entity.currentHP
      }/${p.entity.maxHP} - ${p.name}</p>`;
  });

  playerHud.innerHTML = playerList;
};

function switchToGameMode() {
  document.getElementById("landing-page").style.display = "none";
  document.getElementById("game-container").style.display = "block";
  document.getElementById("ending-page").style.display = "none";
}
function switchToEndGame() {
  document.getElementById("ending-page").style.display = "block";
  document.getElementById("landing-page").style.display = "none";
  document.getElementById("game-container").style.display = "none";
}

function displayPickCharacterHUD() {
  // document.getElementById("pick-hud-container").style.display = "grid";
  document.getElementById("character-hud-container").style.display = "none";

  document.getElementById("picking-team").textContent =
    (currentTeam == TEAM ? "Your turn" : "Enemy's turn") +
    " to " +
    (pickOrBanIndex < c.CONSTANTS.PICK_BAN_ORDER.length
      ? c.CONSTANTS.PICK_BAN_ORDER[pickOrBanIndex]
      : "...");
  document.getElementById("picking-team").style.color = currentTeam;
  // document.getElementById("pick-hud-container").textContent = " you are team " + TEAM;

  let currentEntity = entities.find((e) => e.selected);
  if (!currentEntity) currentEntity = entities.find((e) => e.hovered);
  if (currentEntity) {
    document.getElementById("picking-name").textContent = currentEntity.name;
    document.getElementById("picking-title").textContent = currentEntity.title;
    document.getElementById("picking-difficulty").textContent =
      "Difficulty: " + displayStars(currentEntity.difficulty);
    document.getElementById("picking-description").textContent =
      currentEntity.description;
    //hoveredEntity.spellsDisplay
    // console.log(hoveredEntity.spellsDisplay)
    document.getElementById("display-spells").style.display = "block";
    for (let i = 0; i < currentEntity.spellsDisplay.length; i++) {
      let spell = currentEntity.spellsDisplay[i];
      // console.log("display spell "+spell?.name)
      if (spell) {
        let divSpell = document.getElementById(`spell-display-${i}`);
        divSpell.getElementsByClassName("content")[0].textContent =
          `${spell.name} ` +
          (spell.cooldown ? `${"(CD: " + spell.cooldown + ")"}` : ``);
        divSpell.getElementsByClassName(
          "description",
        )[0].textContent = `${spell.description}`;
      }
    }
  }
  function displayStars(num) {
    let stars = "";
    for (let i = 0; i < num; i++) {
      stars += "⭐️";
    }
    return stars;
  }
}

module.exports = {
  displayProfiles,
  displayCharacterHUD,
  switchToGameMode,
  switchToEndGame,
  displayPickCharacterHUD,
};
