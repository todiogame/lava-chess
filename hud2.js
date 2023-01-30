
function clickSpell(id) {
  console.log("clicspell")
  modeClic = "SPELL"
  spellID = id
  cleanCastRange();
  showCastRange();
  // drawMap();
}

function clickMove() {
  if (currentPlayer.movePoint) modeClic = "MOVE"
  cleanCastRange();
  showCastRange();
  // drawMap();
}


function clickRiseLava() {
  if (currentPlayer.riseLavaPoint) modeClic = "RISE_LAVA"
  cleanCastRange();
  showCastRange();
  // drawMap();
}

function passTurnHUD() {
  modeClic = ""
  cleanCastRange();
  // drawMap();
  passTurn();
}

function displayCharacterHUD(player) {
  let hud = `
      <div class="character-hud">
      <h1> ${player.name}</h1>
      <div class="current-hp">Current HP: ${player.currentHP}/${player.maxHP}</div>
      <div class="move">
      <button class="cast-spell" onclick="clickMove()">Move
        <span class="cooldown">${player.movePoint} point</span>
      </button>
        </div>
      <div class="spells">
        ${player.spells.map((spell, id) =>
    `<button class="cast-spell ${spell.currentCD > 0 ? 'disabled' : ''}" onclick="clickSpell(${id})" data-spell="${spell.name}" ${spell.currentCD > 0 ? 'disabled' : ''}>
            ${spell.name} 
            <span class="cooldown">${spell.currentCD > 0 ? spell.currentCD : ''}</span>
          </button>`
  ).join('')}
      </div>
      
      <div class="rise-lava">
      <button class="cast-spell" onclick="clickRiseLava()">Rise lava
        <span class="cooldown">${player.riseLavaPoint} point</span>
      </button>
        </div>

        <div class="pass">
        <button class="cast-spell" onclick="passTurnHUD()" ${player.riseLavaPoint ? 'disabled' : ''}>Pass turn</button>
          </div>
      </div>
    `;
  document.getElementById("character-hud-container").innerHTML = hud;
}