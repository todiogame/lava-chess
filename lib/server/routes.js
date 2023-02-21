const express = require('express');
const router = express.Router();
const database = require("./Database")
const bcrypt = require('bcrypt');
const saltRounds = 10;
const Encrypt = require("./Encrypt")
const config = require("../../config")
const jwt = require('jsonwebtoken');
const secretKey = 'your-secret-key';

// Create user account route
router.post('/create-account', async (req, res) => {
   const { name, email, password, levelform, experienceform, eloform } = req.body;
   let level = levelform ? (levelform >= 5 ? 5 : levelform) : 1;
   let experience = experienceform ? (levelform >= 5 ? 0 : (experienceform >= 1000 ? 0 : experienceform)) : 0;
   let elo = (eloform && eloform >= 1000) ? (eloform >= 1050 ? 1050 : eloform) : 1000;
   try {
      const hashedPassword = await bcrypt.hash(password, saltRounds);
      await database.insertUser(
         name,
         email,
         hashedPassword,
         level,
         experience,
         elo);
      res.send('User created successfully');
   } catch (error) {
      if (error.message.includes('UNIQUE constraint failed')) {
         return res.status(400).send({ error: 'Email already exists' });
      }
      console.error(error);
      res.status(500).send({ error: 'Failed to create user' });
   }
});


router.post('/login', async (req, res) => {
   console.log(req.body)
   const { email, password } = req.body;
   console.log(email, password)
   try {
      const user = await database.getUserByEmail(email);
      if (!user) {
         return res.status(401).send({ error: 'Email or password is incorrect' });
      }
      const isPasswordMatch = await bcrypt.compare(password, user.password);
      if (!isPasswordMatch) {
         return res.status(401).send({ error: 'Email or password is incorrect' });
      }

  
      // Generate a JWT token and send it back to the client
      const token = jwt.sign({ id: user.id }, secretKey, { expiresIn: '1h' });
      res.cookie('token', token);

      res.redirect('/index.html'); // redirect to index.html on success
   } catch (error) {
      console.error(error);
      res.status(500).send({ error: 'Failed to log in' });
   }
});

router.get('/users', (req, res) => {
   database.getUsers((err, rows) => {
      if (err || !config.TEST) {
         res.send({ error: err.message });
      } else {
         res.send({ data: rows });
      }
   });
});

//encode and decode guest data
router.post('/guest_encrypt', async (req, res) => {
   const gameData = req.body;
   res.send(Encrypt.encryptLocalData(gameData))
});

// Endpoint to receive the encrypted data and return the decrypted data
router.post('/guest_decrypt', (req, res) => {
   const encryptedData = req.body;
   res.send(Encrypt.decryptLocalData(encryptedData))
});


router.get('/getLeaderboard', (req, res) => {

   database.getLeaderboard((err, rows) => {
      if (err) {
         res.send({ error: err.message });
      } else {
         res.send({ data: rows });
      }
   });

});


module.exports = router;