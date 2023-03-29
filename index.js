const express = require("express");
const sequelize = require('./config/sequelize');
const passport = require('passport');
const session = require('express-session');
const { readdirSync } = require("fs");
const LocalStrategy = require('passport-local');
const userRoutes = require('./routes/users');
const dotenv = require('dotenv')
dotenv.config();
const app = express();


PORT = process.env.PORT || 3000

app.get("/", (req, res) => {
    res.send('working')
})

//get db

// get users


const sessionConfig = {
    name: 'session',
    secret: 'secret',
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}


app.use(session(sessionConfig))

// app.use(passport.initialize());
// app.use(passport.session());



// passport.use(new LocalStrategy(User.authenticate()));

// passport.serializeUser(User.serializeUser());
// passport.deserializeUser(User.deserializeUser());


app.use(express.urlencoded({ extended: true }));
app.use(express.json());


readdirSync("./routes").map((path) =>
    app.use("/", require(`./routes/${path}`))
);


app.listen(PORT, () => {
    console.log(`app is listening on port ${PORT}`)
})