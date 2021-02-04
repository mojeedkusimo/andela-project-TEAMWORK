const router = require("express").Router();
const { createUser, signIn, postGif, postArticle } = require("../controllers/");
const { adminRoutes, isLoggedIn } = require("../middlewares")

router.post("/auth/create-user", adminRoutes, createUser)
      .post("/auth/signin", signIn)
      .post("/gifs", isLoggedIn, postGif)
      .post("/articles", isLoggedIn, postArticle)

module.exports = router;