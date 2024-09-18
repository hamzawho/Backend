const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const mysql = require('mysql');
const cors = require('cors');

const app = express();
// app.use(cors({
//   origin: 'http://thedemoapp.online'
// }));

app.use(cors({
  origin: '*'
}));

app.use(express.json());

const db = mysql.createConnection({
  // host: '13.60.192.9',
  user: 'root', 
  password: 'hamza', 
  database: 'rockhairsaloon',
  // port: 3306  
});


db.connect( (err) => { 
  if (err) {
    console.error('Error connecting to database:', err);
    return;
  }
  console.log('Connected to database!');
});


app.get('/', (req, res) => {
   return res.json(" BACKENNNND SIDE");
});

// User sign-in endpoint
app.post('/signin', async (req, res) => {
    const { email, password } = req.body;

    // Check if email exists
    const query = `SELECT * FROM users WHERE email = ?`;
    db.query(query, [email], async (err, results) => {
        if (err) {
            return res.status(500).json({ message: 'Database error' });
        }

        if (results.length === 0) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const user = results[0];

        // Compare the provided password with the hashed password in the database
        const match = await bcrypt.compare(password, user.password);

        if (!match) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        // Generate a JWT token
        const token = jwt.sign(
            { id: user.id, email: user.email },
            process.env.JWT_SECRET, // Use your JWT secret
            { expiresIn: '1h' }
        );

        // Send the token and user information
        res.status(200).json({
            message: 'Sign-in successful',
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email
            }
        });
    });
});


// User signup endpoint
app.post('/signup', async (req, res) => {
    const { name, email, password } = req.body;

    // Check if email already exists
    const queryEmailExists = `SELECT * FROM users WHERE email = ?`;
    db.query(queryEmailExists, [email], async (err, results) => {
        if (results.length > 0) {
            return res.status(400).json({ message: 'Email already exists' });
        }

        // Hash password before storing it
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert new user into the database
        const query = `INSERT INTO users (name, email, password) VALUES (?, ?, ?)`;
        db.query(query, [name, email, hashedPassword], (err, result) => {
            if (err) {
                return res.status(500).json({ message: 'Database error' });
            }
            res.status(201).json({ message: 'User created successfully' });
        });
    });
});

app.get('/getusers', (req, res) => {
   const sql = 'SELECT * FROM `user` ORDER BY id DESC';
   db.query(sql, (err, data) => {
      if (err) return res.json(err);

      // Format the date before sending it back
      const formattedData = data.map(user => ({
         id: user.id,
         name: user.name,
         age: user.age,
         Death: new Date(user.Death).toISOString().split('T')[0] 
      }));

      return res.json(formattedData);
   });
}); 


app.post('/saveuser', (req, res) => {
   const body = req.body;
   const sql = `INSERT INTO user (name, age, Death) VALUES (?, ?, ?)`;
   const values = [body.name, body.age, body.Death];

   db.query(sql, values, (err, results) => {
      if (err) {
         console.log(err);
         res.status(500).json({ status: 'error' });
      } 
      else {
         res.status(200).json({ status: 'inserted' });
      }
   });
});

app.delete('/delete', (req, res) => {
   const id = req.query.id;
   const sql = 'DELETE FROM user WHERE id = ?';
   const values = [id];

   db.query(sql, values, (err, result) => {
      if (err) 
      {
         console.log(err);
         res.status(500).json({ status: 'error' });
      } 
      else {
         if (result.affectedRows > 0)
          {
            res.status(200).json({ status: 'deleted' });
         }
      }
   });
});

app.put('/update', (req, res) => {
   const id = req.query.id;
   const body = req.body;
 
   const sql = `UPDATE user SET name=?, age=?, Death=? WHERE id=?`;
   const values = [body.name, body.age, body.Death, id];
 
   db.query(sql, values, (err, result) => {
     if (err) {
       console.log(err);
       res.status(500).json({ status: 'error' });
     } else {
       if (result.affectedRows > 0) {
         res.status(200).json({ status: 'updated' });
       } else {
         res.status(404).json({ status: 'not found' });
       }
     }
   });
 });

app.listen(8083, () => {
   console.log("LISTENING");
});

