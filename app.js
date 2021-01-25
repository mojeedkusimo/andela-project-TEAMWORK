const express = require("express");
const bodyParser = require("body-parser");

const app = express();

app.use(bodyParser.json());

app.get("/", (req, res) => {
    return res.send("Welcome to Andela Project: TEAMWORK");
})

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

app.listen(5000, () => {
    console.log("Server running on port 5000...");
})