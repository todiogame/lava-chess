const express = require('express');
const router = express.Router();
const database = require("./Database")
const bcrypt = require('bcrypt');
const saltRounds = 10;

// Create user account route
router.post('/create-account', async (req, res) => {
   const { name, email, password } = req.body;
   try {
     const hashedPassword = await bcrypt.hash(password, saltRounds);
     await database.insertUser(name, email, hashedPassword);
     res.send('User created successfully');
   } catch (error) {
     if (error.message.includes('UNIQUE constraint failed')) {
       return res.status(400).send({ error: 'Email already exists' });
     }
     console.error(error);
     res.status(500).send({ error: 'Failed to create user' });
   }
 });

router.get('/users', (req, res) => {
   database.getUsers((err, rows) => {
      if (err) {
         res.send({ error: err.message });
      } else {
         res.send({ data: rows });
      }
   });
});


module.exports = router;