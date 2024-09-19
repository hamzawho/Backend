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
const jwt = require('jsonwebtoken');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET;


const app = express();
app.use(cors({ origin: '*' }));
app.use(express.json());

// Database Connection
const db = mysql.createConnection({
  // host: 'localhost', // Replace with your database host
  user: 'root',
  password: 'hamza', // Replace with your database password
  database: 'rockhairsaloon' // Replace with your database name
});

db.connect((err) => {
  if (err) {
    console.error('Error connecting to database:', err);
    return;
  }
  console.log('Connected to database!');
});

// Utility Functions
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: '1h' });
};

// Middleware to Authenticate Requests
const authenticate = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  
  if (!token) return res.status(401).json({ message: 'No token provided' });

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) return res.status(401).json({ message: 'Invalid token' });

    req.userId = decoded.id; // Attach user ID to request
    next();
  });
};

// User Signup Endpoint
app.post('/signup', async (req, res) => {
  const { name, email, password } = req.body;

  // Check if email already exists
  const queryEmailExists = 'SELECT * FROM users WHERE email = ?';
  db.query(queryEmailExists, [email], async (err, results) => {
    if (results.length > 0) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    // Hash password before storing it
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert new user into the database
    const query = 'INSERT INTO users (name, email, password) VALUES (?, ?, ?)';
    db.query(query, [name, email, hashedPassword], (err, result) => {
      if (err) {
        return res.status(500).json({ message: 'Database error' });
      }
      res.status(201).json({ message: 'User created successfully' });
    });
  });
});

// User Login Endpoint
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  const query = 'SELECT * FROM users WHERE email = ?';
  db.query(query, [email], async (err, results) => {
    if (results.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const user = results[0];
    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = generateToken(user.id);
    res.json({ token });
  });
});

// Save User Data Endpoint
app.post('/saveuser', authenticate, (req, res) => {
  const { name, age, Death } = req.body;
  const userId = req.userId;

  const sql = 'INSERT INTO user_data (user_id, name, age, Death) VALUES (?, ?, ?, ?)';
  db.query(sql, [userId, name, age, Death], (err, results) => {
    if (err) {
      return res.status(500).json({ message: 'Database error' });
    }
    res.status(200).json({ message: 'Data saved successfully' });
  });
});

// Get User Data Endpoint
app.get('/getusers', authenticate, (req, res) => {
  const userId = req.userId;

  const sql = 'SELECT * FROM user_data WHERE user_id = ? ORDER BY id DESC';
  db.query(sql, [userId], (err, data) => {
    if (err) {
      return res.status(500).json({ message: 'Database error' });
    }

    const formattedData = data.map(user => ({
      id: user.id,
      name: user.name,
      age: user.age,
      Death: new Date(user.Death).toISOString().split('T')[0]
    }));

    res.json(formattedData);
  });
});

// Update User Data Endpoint
app.put('/update', authenticate, (req, res) => {
  const id = req.query.id;
  const { name, age, Death } = req.body;

  const sql = 'UPDATE user_data SET name=?, age=?, Death=? WHERE id=? AND user_id=?';
  const values = [name, age, Death, id, req.userId];

  db.query(sql, values, (err, result) => {
    if (err) {
      return res.status(500).json({ message: 'Database error' });
    }
    if (result.affectedRows > 0) {
      res.status(200).json({ message: 'Data updated successfully' });
    } else {
      res.status(404).json({ message: 'Data not found' });
    }
  });
});

// Delete User Data Endpoint
app.delete('/delete', authenticate, (req, res) => {
  const id = req.query.id;

  const sql = 'DELETE FROM user_data WHERE id = ? AND user_id = ?';
  db.query(sql, [id, req.userId], (err, result) => {
    if (err) {
      return res.status(500).json({ message: 'Database error' });
    }
    if (result.affectedRows > 0) {
      res.status(200).json({ message: 'Data deleted successfully' });
    } else {
      res.status(404).json({ message: 'Data not found' });
    }
  });
});

// Start Server
app.listen(8083, () => {
  console.log(`Server is running on port ${PORT}`);
});



