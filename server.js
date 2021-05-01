const express = require('express');
const app = express();
const http = require('http')
const port = 3000;
const cors = require("cors");
const router = express.Router();
const path = require('path')
const expressValidator = require('express-validator');
const userRoutes = require("./routes/user");
var server = http.createServer(app);

// const router = require('./models/routes');
// const checkAuth  = require('./middleware/check-auth');

app.use(express.json());
app.use(
  express.urlencoded({
    extended: false,
  })
);
app.use(cors());
app.use(express.static(path.join(__dirname,'./frontend')));
app.use(expressValidator());

app.post('/add', (req,res) => {
    console.log('hi in add');
})
app.use("/user", userRoutes);

server.listen(port, () => {
    console.log(`App running on port ${port}.`)
  });