const express = require("express");
const path = require("path");
const fs = require("fs");
const PORT = process.env.PORT || 3030;
const { User } = require("./src/Users");

const app = express();
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));

// var session = require('express-session');
// app.use(session({
//     secret: 'secretkeysdfjsflyoifasd',
//     resave: false,
//     saveUninitialized: true,
//     cookie: { secure: false }
//   }));
  
// Get the functions in the db.js file to use
// const db = require('./src/db')


app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public/html/home.html"));
}); 

app.get("/starters", (req, res) => {
    res.sendFile(path.join(__dirname, "public/html/starters.html"));
});

app.get("/mains", (req, res) => {
    res.sendFile(path.join(__dirname, "public/html/mains.html"));
});

app.get("/drinks", (req, res) => {
    res.sendFile(path.join(__dirname, "public/html/drinks.html"));
});

app.get("/deserts", (req, res) => {
    res.sendFile(path.join(__dirname, "public/html/deserts.html"));
});

app.get("/alcohol", (req, res) => {
    res.sendFile(path.join(__dirname, "public/html/alcohol.html"));
});

app.get("/mocktails", (req, res) => {
    res.sendFile(path.join(__dirname, "public/html/mocktails.html"));
});

app.get("/softDrinks", (req, res) => {
    res.sendFile(path.join(__dirname, "public/html/softDrinks.html"));
});


// custom image streamer
app.get("/images/:file", (req, res) => {
    const filePath = path.join(__dirname, "public/images", req.params.file);

    //check if file exists 
    if (!fstat.existsSync(filePath)) {
        return res.status(404).send("File not found");
    }

    // set dynamic content-type
    const ext = path.extname(filePath).toLowerCase();
    const mimeTypes = {
        ".gif": "image/gif",
        ".jpg": "image/jpeg",
        ".jpeg": "image/jpeg",
        ".png": "image/png",
        ".svg": "image/svg+xml",
        ".webp": "image/webp",
      };

      res.setHeader("Content-Type", mimeTypes[ext] || "application/octet-stream");

      // stream file
      fs.createReadStream(filePath).pipe(res);
});



app.get("/login", (req, res) => {
    res.sendFile(path.join(__dirname, "public/html/login.html"));
});
app.post("/login", async function(req, res) {
    console.log("===> login post: ", req.body);
    params = req.body;
    var user = new User(params.email);
    try {
        var userID = await user.getIDfromEmail();
        console.log("userID in login post", userID);
        if(userID) {
            match = await user.authenticate(params.password);
            if (match) {
                console.log("login match check...", req);
                req.session.uid = userID;
                req.session.loggedin = true;
                //check session id in console
                console.log("Session_ID", req.session.id);
                res.redirect("/home");
            
            }
            else {
                alert("invalid password please try again");
                res.redirect("/login")
            }
        } else {
            res.render("login");
        }
    } catch (err) {
        console.error(`Error while comparing`, err.message);
    }
});




app.get("/signup", (req, res) => {
    res.sendFile(path.join(__dirname, "public/html/signup.html"));
});
app.post("/signup", async function(req, res) {
    console.log("====> signupPost", req.body);
    params = req.body;
    var user = new User(params.email);
    try {
        var userID = await user.getIDfromEmail();
        console.log("userID in signup post: ", userID);
        if(userID) {
            res.send("User already exists")
        } else {
            let result = await user.addUser(params);
            console.log("Result from post sign up: ", result);
            res.redirect("/login");
        }
    } catch (err) {
        console.error(`Error while comparing`, err.message);
    }
})

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
