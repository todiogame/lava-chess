const GuestAccount = require("../GuestAccount")
function retrieve() {
    let res;
    const encryptedData = JSON.parse(localStorage.getItem('gameData'));
    if (encryptedData) {
        fetch('/guest_decrypt', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(encryptedData)
        })
            .then(response => response.json())
            .then(gameData => {
                try {
                    console.log("found user data ", gameData)
                    res = new GuestAccount(gameData.username, gameData.level, gameData.experience, gameData.elo)
                } catch (error) {
                    console.log("No user data found.")
                }
                if (!res) res = new GuestAccount();
                storedData = res;
            })
            .catch(error => console.error(error));
    } else {
        const nameInput = document.getElementById("nickname");
        res = new GuestAccount(nameInput.value);
        storedData = res;
    }
}

function save(postData) {
    fetch('/guest_encrypt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(postData)
    })
        .then(response => response.json())
        .then(encryptedData => {
            // Store the encrypted data in local storage
            localStorage.setItem('gameData', JSON.stringify(encryptedData));
        })
        .catch(error => console.error(error));
}
function updateName(username) {
    updateName
}

module.exports = { retrieve, save, updateName };