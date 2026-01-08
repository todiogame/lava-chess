function playTicSound() {
  console.log("tic")
  var ticSound = document.getElementById("tic-sound");
  if (ticSound) {
    ticSound.currentTime = 0;
    ticSound.play().catch(e => console.log("Audio play failed", e));
  }
}

module.exports = { playTicSound }