const Account = require("../Account")
function retrieve() {
    let res;
    try {
        res = JSON.parse(localStorage.getItem("data"));
        console.log("found user data ", res.username)
        res = new Account(res.username, res.level, res.experience)
    } catch (error) {
        console.log("No user data found.")
    }
    if (!res) res = new Account();
    return res;
}
function save(data) {
    localStorage.setItem("data", JSON.stringify(data));
}

module.exports = { retrieve, save };