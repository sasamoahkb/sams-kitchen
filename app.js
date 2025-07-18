var express = require("express");
var escapeHtml = require("escape-html");
const path = require("path");
const fs = require("fs");
const PORT = process.env.PORT || 3030;
const { User } = require("./src/Users");

const app = express();
app.use(express.static('public'));
app.use(express.json()); // for parsing application/json
app.use(express.urlencoded({ extended: false }));

var session = require("express-session");
app.set("trust proxy", 1); // trust first proxy
app.use(session({
  secret: 'secretkeysdfjsflyoifasd',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: process.env.NODE_ENV === 'production' }
}));

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

function requireAuth(req, res, next) {
    if (req.session.loggedin) {
      next();
    } else {
        return res.redirect("/login");
    }
  }
  
  app.get("/dashboard/:userId", requireAuth, (req, res) => {
    if (req.session.uid == req.params.userId) {
      res.sendFile(path.join(__dirname, "public/html/softDrinks.html"));
    } else {
      res.status(403).send("Unauthorized");
    }
  });
  
app.get("/check-session", (req, res) => {
    req.session.views = (req.session.views || 0) + 1;
    res.send(`Views: ${req.session.views}, UID: ${req.session.uid}`);
});

app.get("/logout", (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.status(500).send("Error logging out.");
        }
        res.clearCookie("connect.sid");
        res.redirect("/login");
    });
});


// custom image streamer
app.get("/images/:file", (req, res) => {
    const filePath = path.join(__dirname, "public/images", req.params.file);

    //check if file exists 
    if (!fs.existsSync(filePath)) {
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

app.post("/login", async function (req, res) {
    console.log("===> login post: ", req.body);
    const params = req.body;
    const user = new User(params.email);

    try {
        const userID = await user.getIDfromEmail();
        console.log("userID in login post", userID);

        if (userID) {
            const match = await user.authenticate(params.password);
            if (match) {
                req.session.uid = userID;
                console.log("Session_UID", req.session.uid);
                console.log("Session_ID", req.session.id);
                return res.redirect(`/dashboard/${req.session.uid}`);
            } else {
                return res.redirect("/login?error=invalidpassword");
            }
        } else {
            return res.redirect("/login?error=usernotfound");
        }
    } catch (err) {
        console.error("Error while logging in:", err.message);
        return res.redirect("/login?error=servererror");
    }
});


app.get("/signup", (req, res) => {
    res.sendFile(path.join(__dirname, "public/html/signup.html"));
});

app.post("/signup", async function (req, res) {
    console.log("====> signupPost", req.body);
    const params = req.body;
    const user = new User(params.email);

    try {
        const userID = await user.getIDfromEmail();
        console.log("userID in signup post: ", userID);
        if (userID) {
            console.log('user already exists');
            return res.redirect("/signup");
        } else {
            const result = await user.addUser(params);
            console.log("Result from post sign up: ", result);
            return res.redirect("/login");

        }
    } catch (err) {
        console.error("Error while signing up:", err.message);
        return res.redirect("/signup?error=servererror");
    }
});


app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
