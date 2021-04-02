const express = require("express");
const routes = require("./routes");
require("dotenv").config();
const cors = require("cors");

const PORT = process.env.PORT || 5000
const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    return res.send("Welcome to Andela Project: TEAMWORK");
})

app.use("/api", routes);

app.use((req, res, next) => {
    let error = new Error("Page Not Found");
    res.status = 404;

    return next(error);
})

app.use((err, req, res, next) => {
    res.status = err.status || 500;

    return res.json({
        message: err.message,
        error: err

    })
})

app.listen(PORT, () => {
    console.log("Server running on port..." + PORT);
})