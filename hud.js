
function clickSpell(id) {
  modeClic = "SPELL"
  spellID = id
  cleanRangeAndHover();
  showCastRange();
  // drawMap();
}

function clickMove() {
  if (currentPlayer.movePoint) modeClic = "MOVE"
  cleanRangeAndHover();
  showCastRange();
  // drawMap();
}


function clickRiseLava() {
  modeClic = "RISE_LAVA"
  cleanRangeAndHover();
  showCastRange();
  // drawMap();
}

function displayCharacterHUD(player) {
  document.getElementById("name").textContent = player.name;
  document.getElementById("current-hp").textContent = `Current HP: ${player.currentHP}/${player.maxHP}`;
  document.getElementById("move-cooldown").textContent = `${player.movePoint} point`;

  for(let i = 0; i < player.spells.length; i++) {
    let spell = player.spells[i];
    let button = document.getElementById(`spell-${i}`);
    button.textContent = `${spell.name} ${spell.currentCD > 0 ? spell.currentCD : ''} ${"("+spell.cooldown+")"}`;
    button.setAttribute("data-spell", spell.name);
    if (spell.currentCD > 0 || spell.passive) {
      button.classList.add("disabled");
      button.setAttribute("disabled", true);
    } else {
      button.classList.remove("disabled");
      button.removeAttribute("disabled");
    }
  }
}
