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

// Fetch user-specific data
app.get('/getusers', (req, res) => {
  const email = req.query.email; // Get email from request query or session
  const sql = 'SELECT * FROM `user` WHERE `user_email` = ? ORDER BY id DESC';
  db.query(sql, [email], (err, data) => {
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

// Insert new user data
app.post('/saveuser', (req, res) => {
  const email = req.body.email; // Get email from request body or session
  const body = req.body;
  const sql = `INSERT INTO user (name, age, Death, user_email) VALUES (?, ?, ?, ?)`;
  const values = [body.name, body.age, body.Death, email];

  db.query(sql, values, (err, results) => {
    if (err) {
      console.log(err);
      res.status(500).json({ status: 'error' });
    } else {
      res.status(200).json({ status: 'inserted' });
    }
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
