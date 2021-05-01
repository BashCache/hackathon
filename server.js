const express = require('express');
const app = express();
const http = require('http')
const port = 3000;
const cors = require("cors");
const router = express.Router();
const path = require('path')
const expressValidator = require('express-validator');
const userRoutes = require("./routes/user");
var exphbs  = require('express-handlebars');
var server = http.createServer(app);
const ejs = require('ejs')

app.use(express.json());
app.use(
  express.urlencoded({
    extended: false,
  })
);
app.use(cors());
app.use(express.static(path.join(__dirname,'./frontend')));
app.set('view engine', 'ejs');

app.use(expressValidator());

app.get('/', (req,res) => {
    res.render('index2')
})
app.use("/user", userRoutes);

server.listen(port, () => {
    console.log(`App running on port ${port}.`)
  });