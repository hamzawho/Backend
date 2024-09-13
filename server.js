const express = require('express');
const mysql = require('mysql');
const cors = require('cors');
const httpProxy = require('http-proxy');

const app = express();

const proxy = httpProxy.createProxyServer();

app.use(cors({
  origin: 'http://thedemoapp.online' // Replace with your domain
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

// app.get('/', (req, res) => {
//    return res.json(" BACKENNNND SIDE");
// });

app.get('/api', (req, res) => {
    // Reverse proxy to your backend server
    proxy.web(req, res, { target: 'http://51.20.73.231:8080/' });
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

app.listen(8080, () => {
   console.log("LISTENING");
});

