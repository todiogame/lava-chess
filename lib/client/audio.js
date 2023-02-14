function playTicSound() {
  console.log("tic")
    var ticSound = document.getElementById("tic-sound");
    ticSound.currentTime = 0;
    ticSound.play();
  }

  module.exports ={ playTicSound}