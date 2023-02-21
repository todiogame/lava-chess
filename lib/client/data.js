const GuestAccount = require("../GuestAccount")
const UserAccount = require("../UserAccount")
function retrieve() {
    let res;
    console.log((document.cookie))
    const loggedInUser = (document.cookie
        .split("; ")
        .find((row) => row.startsWith("userJSON="))
        ?.split("=")[1]);

        console.log(("loggedInUser"))
    console.log((loggedInUser))
    console.log(decodeURIComponent(loggedInUser))
    console.log(decodeURIComponent(decodeURIComponent(loggedInUser)))

    if (loggedInUser) {
        // console.log((loggedInUser))
        // console.log(decodeURI(decodeURI(loggedInUser)))
        let cookieInfo = JSON.parse((decodeURIComponent(loggedInUser)))
        res = new UserAccount(cookieInfo)
        storedData = res;
    } else {
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
}

function save(postData) {
    //todo id connected user, send it to the server ? or useless?
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