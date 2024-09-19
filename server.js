// const express = require('express');
// const bcrypt = require('bcrypt');
// const mysql = require('mysql');
// const cors = require('cors');

// const app = express();
// // app.use(cors({
// //   origin: 'http://thedemoapp.online'
// // }));

// app.use(cors({
//   origin: '*'
// }));

// app.use(express.json());

// const db = mysql.createConnection({
//   // host: '13.60.192.9',
//   user: 'root', 
//   password: 'hamza', 
//   database: 'rockhairsaloon',
//   // port: 3306  
// });


// db.connect( (err) => { 
//   if (err) {
//     console.error('Error connecting to database:', err);
//     return;
//   }
//   console.log('Connected to database!');
// });


// app.get('/', (req, res) => {
//    return res.json(" BACKENNNND SIDE");
// });


// // User signup endpoint
// app.post('/signup', async (req, res) => {
//     const { name, email, password } = req.body;

//     // Check if email already exists
//     const queryEmailExists = `SELECT * FROM users WHERE email = ?`;
//     db.query(queryEmailExists, [email], async (err, results) => {
//         if (results.length > 0) {
//             return res.status(400).json({ message: 'Email already exists' });
//         }

//         // Hash password before storing it
//         const hashedPassword = await bcrypt.hash(password, 10);

//         // Insert new user into the database
//         const query = `INSERT INTO users (name, email, password) VALUES (?, ?, ?)`;
//         db.query(query, [name, email, hashedPassword], (err, result) => {
//             if (err) {
//                 return res.status(500).json({ message: 'Database error' });
//             }
//             res.status(201).json({ message: 'User created successfully' });
//         });
//     });
// });

// app.get('/getusers', (req, res) => {
//    const sql = 'SELECT * FROM `user` ORDER BY id DESC';
//    db.query(sql, (err, data) => {
//       if (err) return res.json(err);

//       // Format the date before sending it back
//       const formattedData = data.map(user => ({
//          id: user.id,
//          name: user.name,
//          age: user.age,
//          Death: new Date(user.Death).toISOString().split('T')[0] 
//       }));

//       return res.json(formattedData);
//    });
// }); 


// app.post('/saveuser', (req, res) => {
//    const body = req.body;
//    const sql = `INSERT INTO user (name, age, Death) VALUES (?, ?, ?)`;
//    const values = [body.name, body.age, body.Death];

//    db.query(sql, values, (err, results) => {
//       if (err) {
//          console.log(err);
//          res.status(500).json({ status: 'error' });
//       } 
//       else {
//          res.status(200).json({ status: 'inserted' });
//       }
//    });
// });

// app.delete('/delete', (req, res) => {
//    const id = req.query.id;
//    const sql = 'DELETE FROM user WHERE id = ?';
//    const values = [id];

//    db.query(sql, values, (err, result) => {
//       if (err) 
//       {
//          console.log(err);
//          res.status(500).json({ status: 'error' });
//       } 
//       else {
//          if (result.affectedRows > 0)
//           {
//             res.status(200).json({ status: 'deleted' });
//          }
//       }
//    });
// });

// app.put('/update', (req, res) => {
//    const id = req.query.id;
//    const body = req.body;
 
//    const sql = `UPDATE user SET name=?, age=?, Death=? WHERE id=?`;
//    const values = [body.name, body.age, body.Death, id];
 
//    db.query(sql, values, (err, result) => {
//      if (err) {
//        console.log(err);
//        res.status(500).json({ status: 'error' });
//      } else {
//        if (result.affectedRows > 0) {
//          res.status(200).json({ status: 'updated' });
//        } else {
//          res.status(404).json({ status: 'not found' });
//        }
//      }
//    });
//  });

// app.listen(8083, () => {
//    console.log("LISTENING");
// });







const express = require('express');
const bcrypt = require('bcrypt');
const mysql = require('mysql');
const cors = require('cors');
const jwt = require('jsonwebtoken'); // For authentication tokens

const app = express();

app.use(cors({
  origin: '*'
}));

app.use(express.json());

const db = mysql.createConnection({
  // Replace with your database credentials
  user: 'root', 
  password: 'hamza', 
  database: 'rockhairsaloon',
});

db.connect((err) => { 
  if (err) {
    console.error('Error connecting to database:', err);
    return;
  }
  console.log('Connected to database!');
});

const JWT_SECRET = 'your_jwt_secret'; // Replace with a secure secret key


// Middleware function to authenticate JWT
function authenticateJWT(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token == null) return res.sendStatus(401); // No token provided

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) return res.sendStatus(403); // Invalid token

    req.user = user;
    next();
  });
}

app.get('/', (req, res) => {
  return res.json("BACKEND SIDE");
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

// User sign-in endpoint
app.post('/signin', (req, res) => {
  const { email, password } = req.body;

  // Find user by email
  const query = `SELECT * FROM users WHERE email = ?`;
  db.query(query, [email], async (err, results) => {
    if (err) {
      return res.status(500).json({ message: 'Database error' });
    }

    if (results.length === 0) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const user = results[0];

    // Compare provided password with hashed password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Generate a token (optional)
    const token = jwt.sign({ email: user.email }, JWT_SECRET, { expiresIn: '1h' });

    // Respond with success and token
    res.status(200).json({ message: 'Login successful', token });
  });
});

app.get('/userdata', authenticateJWT, (req, res) => {
  const email = req.user.email; // Get email from JWT

  // Fetch data from 'user_data' table
  const query = 'SELECT * FROM user_data WHERE email = ?';
  db.query(query, [email], (err, results) => {
    if (err) {
      console.error('Error fetching data:', err);
      return res.status(500).json({ message: 'Failed to fetch data' });
    }
    // Return an empty array if no data is found
    res.json(results.length > 0 ? results : []);
  });
});



app.get('/getusers', (req, res) => {
  const email = req.query.email;

  if (!email) {
    return res.status(400).json({ status: 'error', message: 'Email is required' });
  }

  const query = 'SELECT * FROM users WHERE email = ?';
  db.query(query, [email], (err, results) => {
    if (err) {
      console.error('Error fetching data:', err);
      return res.status(500).json({ status: 'error', message: 'Error fetching data' });
    }

    res.json(results);
  });
});




app.post('/saveuser', authenticateJWT, (req, res) => {
  const userId = req.user.id; // Extracted from the JWT token
  const { name, age, deathDate } = req.body;

  // Insert or update data
  const query = `
    INSERT INTO user_data (user_id, name, age, death_date)
    VALUES (?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE name = VALUES(name), age = VALUES(age), death_date = VALUES(death_date)
  `;
  db.query(query, [userId, name, age, deathDate], (err, results) => {
    if (err) {
      return res.status(500).json({ message: 'Error saving data' });
    }
    res.json({ message: 'Data saved successfully' });
  });
});



// Update user data
app.put('/update', (req, res) => {
  const id = req.query.id;
  const email = req.body.email; // Get email from request body or session
  const body = req.body;

  const sql = `UPDATE user SET name=?, age=?, Death=? WHERE id=? AND user_email=?`;
  const values = [body.name, body.age, body.Death, id, email];

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

// Delete user data
app.delete('/delete', (req, res) => {
  const id = req.query.id;
  const email = req.query.email; // Get email from request query or session
  const sql = 'DELETE FROM user WHERE id = ? AND user_email = ?';
  const values = [id, email];

  db.query(sql, values, (err, result) => {
    if (err) {
      console.log(err);
      res.status(500).json({ status: 'error' });
    } else {
      if (result.affectedRows > 0) {
        res.status(200).json({ status: 'deleted' });
      }
    }
  });
});

app.listen(8083, () => {
  console.log("LISTENING");
});
