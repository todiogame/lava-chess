
function clickSpell(id) {
  console.log("clicspell")
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
  if (currentPlayer.riseLavaPoint) modeClic = "RISE_LAVA"
  cleanRangeAndHover();
  showCastRange();
  // drawMap();
}

function passTurnHUD() {
  modeClic = ""
  cleanRangeAndHover();
  // drawMap();
  passTurn();
}

function displayCharacterHUD(player) {
  document.getElementById("name").textContent = player.name;
  document.getElementById("current-hp").textContent = `Current HP: ${player.currentHP}/${player.maxHP}`;
  document.getElementById("move-cooldown").textContent = `${player.movePoint} point`;
  document.getElementById("rise-lava-cooldown").textContent = `${player.riseLavaPoint} point`;


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
  
  document.getElementById("pass-turn").textContent = "Pass turn";
  if(player.riseLavaPoint) {
    // document.getElementById("pass-turn").classList.add("disabled");
    // document.getElementById("pass-turn").setAttribute("disabled", true);
  } else {
    document.getElementById("pass-turn").classList.remove("disabled");
    document.getElementById("pass-turn").removeAttribute("disabled");
  }
}
