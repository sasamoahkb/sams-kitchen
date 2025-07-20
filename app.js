var express = require("express");
const RedisStore = require("connect-redis").default;
const { createClient } = require("redis");
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

// Redis client setup
const redisClient = createClient({
    url: process.env.REDIS_URL || "redis://localhost:6379"
});
redisClient.connect().catch(console.error);

app.use(session({
  secret: 'secretkeysdfjsflyoifasd',
  resave: false,
  saveUninitialized: false,
  store: new session.RedisStore({ client: redisClient }),
  cookie: { 
    secure: process.env.NODE_ENV === 'production',
    maxAge: 1000 * 60 * 60 // 1 hour
  }
}));

app.use((req, res, next) => {
  const now = Date.now();
  const maxIdleTime = 15 * 60 * 1000; // 15 min

  if (req.session.lastActivity && (now - req.session.lastActivity > maxIdleTime)) {
    req.session.destroy(err => {
      if (err) console.error("Idle timeout destroy failed:", err);
      return res.redirect("/login?error=sessionexpired");
    });
  } else {
    req.session.lastActivity = now;
    next();
  }
});

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

app.post("/login", async function (req, res, next) {
    const { email, password } = req.body;
    const user = new User(email);

    try {
        const userID = await user.getIDfromEmail();
        if (!userID) {
            console.log("No user found");
            return res.redirect("/login?error=usernotfound");
        }

        const match = await user.authenticate(password);
        if (!match) {
            console.log("Incorrect password");
            return res.redirect("/login?error=invalidpassword");
        }

        req.session.regenerate(function (err) {
            if (err) return next(err);

            req.session.uid = userID;
            req.session.save(function (err) {
                if (err) return res.redirect("/login?error=servererror");
                console.log("Session saved, redirecting to dashboard");
                res.redirect(`/dashboard/${userID}?success=Welcome+back+to+Sams+Kitchen`);
            });
        });

    } catch (err) {
        console.error("Login error:", err.message);
        return res.redirect("/login?error=servererror");
    }
});

function requireAuth(req, res, next) {
    if (req.session.uid === req.params.userID) {
        next();
    } else {
        req.session.destroy(err => {
            if (err) {
                console.error("Failed to destroy session:", err);
            }
            return res.redirect("/login?error=sessionexpired");
        });
    }
}


  
app.get("/dashboard/:userID", requireAuth, (req, res) => {
    if (req.session.uid == req.params.userID) {
      res.sendFile(path.join(__dirname, "public/html/dashboard.html"));
    } else {
      res.status(403).sendFile(path.join(__dirname, "public/html/403.html"));

    }
});
  
app.get("/check-session", (req, res) => {
    if (!req.session) return res.status(401).send("Session not available.");

    req.session.views = (req.session.views || 0) + 1;
    res.json({
        message: "Session active",
        views: req.session.views,
        uid: req.session.uid
    });
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

app.get("/signup", (req, res) => {
    res.sendFile(path.join(__dirname, "public/html/signup.html"));
});

app.post("/signup", async function (req, res) {
    console.log("====> signupPost", req.body);
    const params = req.body;
    const email = params.email ? params.email.trim() : "";
    const password = params.password ? params.password.trim() : "";

    const user = new User(email);
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

    try {
        // Check if email is provided
        if (!emailRegex.test(email)) {
            console.log("Invalid email format");
            return res.redirect("/signup?error=invalidemail");
        }
        // Check if password is provided
        if (!password || password === "") {
            console.log("no password provided");
            return res.redirect("/signup?error=nopassword");
        }
        // Check if password meets strong criteria
        if (!strongPasswordRegex.test(password)) {
            console.log("Weak password");
            return res.redirect("/signup?error=weakpassword");
        }
        
        const userID = await user.getIDfromEmail();
        console.log("userID in signup post: ", userID);
        
        // Check if user already exists
        if (userID) {
            console.log('user already exists');
            return res.redirect("/signup?error=userexists");
        }
        
        // Add user to the database
        console.log("Adding user with params: ", params);
        const result = await user.addUser(params);
        console.log("Result from post sign up: ", result);
        return res.redirect("/login?success=accountcreated");
        

    } catch (err) {
        console.error("Error while signing up:", err.message);
        return res.redirect("/signup?error=servererror");
    }
});


app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
