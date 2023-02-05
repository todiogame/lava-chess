
function displayCharacterHUD(player) {
  if (player) {
    document.getElementById("name").textContent = player.name;
    document.getElementById("current-hp-text").textContent = `HP: ${player.entity.currentHP}/${player.entity.maxHP}`;
    document.getElementById("hp-value").style.width = `${(player.entity.currentHP / player.entity.maxHP) * 100}%`;
    document.getElementById("move-cooldown").textContent = `${player.movePoint} point`;

    for (let i = 0; i < player.spells.length; i++) {
      let spell = player.spells[i];
      if (spell) {
        let button = document.getElementById(`spell-${i}`);
        button.getElementsByClassName( 'content' )[0].textContent = `${spell.name} ${spell.currentCD > 0 ? spell.currentCD : ''} ${"(" + spell.cooldown + ")"}`;
        button.getElementsByClassName( 'tooltip' )[0].textContent = `${spell.description}`;
        button.setAttribute("data-spell", spell.name);
        if (spell.currentCD > 0 || spell.passive || (player.entity.auras.length && player.entity.auras.some(a => a.name == "silence"))) {
          button.classList.add("disabled");
          button.setAttribute("disabled", true);
        } else {
          button.classList.remove("disabled");
          button.removeAttribute("disabled");
        }
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

  PLAYERS.forEach(p => {
    if (!p.dead)
      playerList += `<p  ${p == currentP ? `class="highlight"` : ``}>${p.entity.currentHP}/${p.entity.maxHP} - ${p.name}</p>`;

  });

  playerHud.innerHTML = playerList;
};

module.exports = {
  displayCharacterHUD
};