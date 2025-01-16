const express=  require('express');
const session = require('express-session');
const morgan = require('morgan');
const mongoose = require('mongoose');
const compRoutes = require('./routes/compRoutes');
const adminRoutes = require('./routes/adminRoutes');
const unlogRoutes = require('./routes/unlogRoutes');
const path = require('path');

// temp
const app = express();

const dbURI = 'mongodb+srv://User1:Wasi12345@competition.oxzypy3.mongodb.net/Competition?retryWrites=true&w=majority&appName=Competition'

mongoose.connect(dbURI)
  .then((result)=>{
    app.listen(3000, ()=>{
        console.log("Server is running on port 3000");
    });
  })
  .catch((err)=>{
    console.log(err);
  });

app.set('view engine', 'ejs');

app.use(morgan('dev'));
app.use(express.urlencoded({ extended:true }));
app.use(express.static('public'));
app.use('/uploads', express.static('uploads'));

app.use(express.json());

app.use(session({
  secret: 'boring  company',
  resave: false,
  saveUninitialized: true
}));

app.use('/', unlogRoutes);
app.use('/admins', adminRoutes);
app.use('/competitions', compRoutes);

// Define error handling middleware
function sessionLogout(err, req, res, next) {
  if (err.message && err.message.includes("Cannot read properties of undefined (reading 'username')")) {
      // Redirect to the login page
      return res.redirect('/login');
  }

  // For other errors, proceed to the next middleware
  next(err);
}

app.use(sessionLogout);

app.use((req, res)=>{
    res.status(404).render('404', { title:"404" });
});