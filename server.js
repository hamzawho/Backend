// const express = require('express');
// const mysql = require('mysql');
// const cors = require('cors');

// const app = express();
// // app.use(cors());
// app.use(cors({
//   origin: 'http://thedemoapp.online/', // Replace with your actual frontend URL
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
const mysql = require('mysql');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 8083;

// CORS configuration
app.use(cors({
  origin: 'http://thedemoapp.online', // Allow your frontend domain
}));

app.use(express.json());

// MySQL connection
const db = mysql.createConnection({
  host: 'localhost', // Adjust if needed
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

// API endpoint for backend
app.get('/', (req, res) => {
  return res.json("BACKEND SIDE");
});

app.get('/api/getusers', (req, res) => {
  const sql = 'SELECT * FROM `user` ORDER BY id DESC';
  db.query(sql, (err, data) => {
    if (err) return res.json(err);

    // Format the date before sending it back
    const formattedData = data.map(user => ({
      id: user.id,
      name: user.name,
      age: user.age,
      Death: new Date(user.Death).toISOString().split('T')[0],
    }));

    return res.json(formattedData);
  });
}); 

app.post('/api/saveuser', (req, res) => {
  const body = req.body;
  const sql = `INSERT INTO user (name, age, Death) VALUES (?, ?, ?)`;
  const values = [body.name, body.age, body.Death];

  db.query(sql, values, (err) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ status: 'error' });
    } 
    return res.status(200).json({ status: 'inserted' });
  });
});

app.delete('/api/delete', (req, res) => {
  const id = req.query.id;
  const sql = 'DELETE FROM user WHERE id = ?';
  const values = [id];

  db.query(sql, values, (err, result) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ status: 'error' });
    } 
    if (result.affectedRows > 0) {
      return res.status(200).json({ status: 'deleted' });
    }
    return res.status(404).json({ status: 'not found' });
  });
});

app.put('/api/update', (req, res) => {
  const id = req.query.id;
  const body = req.body;

  const sql = `UPDATE user SET name=?, age=?, Death=? WHERE id=?`;
  const values = [body.name, body.age, body.Death, id];

  db.query(sql, values, (err, result) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ status: 'error' });
    }
    if (result.affectedRows > 0) {
      return res.status(200).json({ status: 'updated' });
    } else {
      return res.status(404).json({ status: 'not found' });
    }
  });
});

// Serve the frontend files from the Vite build
app.use(express.static(path.join(__dirname, 'dist')));

// Serve index.html for all other routes (frontend routing)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Start the server
app.listen(8083, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
