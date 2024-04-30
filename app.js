const express=  require('express');
const morgan = require('morgan');
const bodyParser = require("body-parser");
const mongoose = require('mongoose');
const compRoutes = require('./routes/compRoutes');


const app = express();
const port = 3000;
mongoose.connect("mongodb+srv://raiyanwasisiddiky:Wasi1to6@471db.75x1hsi.mongodb.net/471db")
  .then((result) =>{
    app.listen(port, ()=>{
      console.log(`Server is running on port ${port}`);
    });
  })
  .catch((err)=>{
    console.log(err);
  });


app.set('view engine', 'ejs');

app.use(morgan('dev'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

app.use(bodyParser.json());



app.use('/', compRoutes);

app.use((req, res)=>{
  res.status(404).render('404');
});


