import express from "express";
import morgan from "morgan";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
// import mongoose from "mongoose";
import cors from "cors";
// import checkAuth from "./middleware/check-auth.js";
// import signInRoutes from "./routes/signIn.js";
// import signUpRoutes from "./routes/signUp.js";
// import postRoutes from "./routes/posts.js";
// import userRoutes from "./routes/users.js";
// import linkRoutes from "./routes/link.js";
const app = express();

// mongoose.connect(
//   "mongodb+srv://TestUser1551:Trying123@cluster0.wa5snfn.mongodb.net/OnePiece?retryWrites=true&w=majority",
//   {
//     useCreateIndex: true,
//     useNewUrlParser: true,
//     useUnifiedTopology: true
//   }
// );
// mongoose.Promise = global.Promise;

// Used to log everything like GET, POST, etc requests
app.use(morgan("dev"));
app.use(cors());
app.use(
  bodyParser.urlencoded({
    extended: false,
    limit: "50mb",
    parameterLimit: 50000
  })
);
app.use(bodyParser.json({ limit: "50mb" }));
app.use(cookieParser());

const v2Router = express.Router();

// Routes
// app.use("/api/signIn", signInRoutes);
// app.use("/api/signUp", signUpRoutes);
// app.use("/link", linkRoutes);
// v2Router.use("/link", linkRoutes);
// v2Router.use("/posts", postRoutes);
// v2Router.use("/user", userRoutes);
// app.use("/api/v2", checkAuth, v2Router);

export default app;
