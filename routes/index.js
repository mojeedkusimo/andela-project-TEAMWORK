const router = require("express").Router();
const { createUser, signIn, postGif, postArticle, editArticle, deleteArticle, deleteGif } = require("../controllers/");
const { adminRoutes, isLoggedIn } = require("../middlewares")

router.post("/auth/create-user", adminRoutes, createUser)
      .post("/auth/signin", signIn)
      .post("/gifs", isLoggedIn, postGif)
      .post("/articles", isLoggedIn, postArticle)
      .patch("/articles/:articleId", isLoggedIn, editArticle)
      .delete("/articles/:articleId", isLoggedIn, deleteArticle)
      .delete("/gifs/:gifId", isLoggedIn, deleteGif)

module.exports = router;