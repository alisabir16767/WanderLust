const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");
const listingsRoute = require("./routes/listing");
const reviewsRoute = require("./routes/review");
const userRoute = require("./routes/user");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user");
const MongoStore = require("connect-mongo"); // Import connect-mongo

require("dotenv").config(); // Load environment variables from .env file

// Use MongoDB for session storage
const sessionOptions = {
  store: MongoStore.create({
    mongoUrl: process.env.MONGO_URL, // Use MongoDB connection URL from .env
    ttl: 7 * 24 * 60 * 60, // Session TTL (Time to Live) for 1 week
    autoRemove: "native", // Automatically remove expired sessions
  }),
  secret: process.env.SESSION_SECRET, // Use the secret from .env
  resave: false,
  saveUninitialized: true,
  cookie: {
    expires: Date.now() + 7 * 24 * 60 * 60 * 1000, // Cookie expires in 1 week
    maxAge: 7 * 24 * 60 * 60 * 1000, // Cookie max age (1 week)
    httpOnly: true, // Make the cookie HTTP-only for security
  },
};

app.get("/", (req, res) => {
  res.send("Hi, I am root");
});

app.use(cookieParser());
app.engine("ejs", ejsMate);
app.use(methodOverride("_method"));
app.use(session(sessionOptions)); // Using MongoDB-backed sessions
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// MongoDB connection URL from .env
const MONGO_URL = process.env.MONGO_URL;
async function main() {
  await mongoose.connect(MONGO_URL);
  console.log("Connected to DB");
}

main().catch((err) => {
  console.log(err);
});

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "/public")));

app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currUser = req.user;

  next();
});

// Routes
app.use("/listings", listingsRoute);
app.use("/listings/:id/review", reviewsRoute);
app.use("/user", userRoute);

app.all("*", (req, res, next) => {
  next(new ExpressError(404, "Page Not Found"));
});

app.use((err, req, res, next) => {
  const { statusCode = 500, message = "An unexpected error occurred" } = err;
  res.status(statusCode).render("error.ejs", { message });
});

// Use the PORT from .env (default to 8080 if not set)
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});
