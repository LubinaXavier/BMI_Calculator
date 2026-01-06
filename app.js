const express = require('express');
const mysql = require('mysql2');
const session = require('express-session');
const bcrypt = require('bcrypt');
const path = require('path');
require('dotenv').config();
const {
  calculateBMI,
  getBMIResult,
  getIdealWeightRange
} = require('./utils/bmiUtil');


const app = express();
const PORT = process.env.PORT || 3000;

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});


db.connect((err) => {
  if (err) {
    console.log("Database connection failed");
  }
  console.log('Connected to MySQL database');
});


app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname,"/public")));

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 24 * 60 * 60 * 1000 } 
}));

app.set('view engine', 'ejs');
app.set("views",path.join(__dirname,"/public/views"));

app.use((req, res, next) => {
  res.locals.user = req.session.user || null;
  next();
});

app.get('/', (req, res) => {
  res.render('home');
});

app.get('/about', (req, res) => {
  res.render('about');
});

app.get('/contact', (req, res) => {
  res.render('contact');
});

app.get('/calculator', (req, res) => {
  if (!req.session.user) {
    return res.redirect('/login');
  }
  res.render('calculator');
});

app.get('/login', (req, res) => {
  res.render('login');
});

app.get('/register', (req, res) => {
  res.render('register');
});

app.get('/history', (req, res) => {
  if (!req.session.user) {
    return res.redirect('/login');
  }
  
  const query = "SELECT * FROM bmi_records WHERE user_id = ? ORDER BY created_at DESC LIMIT 20";
  
  db.query(query, [req.session.user.id], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Error fetching history');
    }
    res.render('history', { records: results });
  });
});
app.delete('/history/:id', (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const recordId = req.params.id;

  const query = `
    DELETE FROM bmi_records 
    WHERE id = ? AND user_id = ?
  `;

  db.query(query, [recordId, req.session.user.id], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Failed to delete record' });
    }

    res.json({ success: true });
  });
});


app.post('/register', async (req, res) => {
  const { name, email, password } = req.body;
  
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const query = 'INSERT INTO users (name, email, password) VALUES (?, ?, ?)';
    
    db.query(query, [name, email, hashedPassword], (err) => {
      res.json({ success: true, message: 'Registration successful' });
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});


app.post('/login', (req, res) => {
  const { email, password } = req.body;
  
  const query = 'SELECT * FROM users WHERE email = ?';
  db.query(query, [email], async (err, results) => {
    if (err || results.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const user = results[0];
    const match = await bcrypt.compare(password, user.password);
    
    if (!match) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    req.session.user = { id: user.id, name: user.name, email: user.email };
    res.json({ success: true, message: 'Login successful' });
  });
});


app.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/');
});


app.post('/calculate', (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ error: 'Please login first' });
  }

  const { weight, height, age, gender } = req.body;

  const bmi = calculateBMI(weight, height);
  const { category, healthRisk, recommendations } = getBMIResult(bmi);
  const idealWeightRange = getIdealWeightRange(height);

  const query = `
    INSERT INTO bmi_records 
    (user_id, weight, height, age, gender, bmi, category, health_risk, recommendations) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(
    query,
    [
      req.session.user.id,
      weight,
      height,
      age,
      gender,
      bmi,
      category,
      healthRisk,
      recommendations
    ],
    (err) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: 'Failed to save BMI record' });
      }

      res.json({
        bmi,
        category,
        healthRisk,
        recommendations,
        idealWeightRange
      });
    }
  );
});


app.post('/contact', (req, res) => {
  const { name, email, message } = req.body;
  
  const query = 'INSERT INTO contact_messages (name, email, message) VALUES (?, ?, ?)';
  db.query(query, [name, email, message], (err) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to send message' });
    }
    res.json({ success: true, message: 'Message sent successfully' });
  });
});


app.listen(PORT, () => {
  console.log("Server running on port 3000");
});