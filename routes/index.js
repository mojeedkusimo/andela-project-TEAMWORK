const router = require("express").Router();
const { createUser, signIn, postGif, postArticle, editArticle, deleteArticle, deleteGif, commentArticle, commentGif, getFeed, getArticle, getGif, flagArticle, deleteFlaggedArticle, flagGif, deleteFlaggedGif, flagArticleComment, deleteFlaggedArticleComment, flagGifComment, deleteFlaggedGifComment, getArticleTag } = require("../controllers/");
const { adminRoutes, isLoggedIn } = require("../middlewares")

router.post("/auth/create-user", adminRoutes, createUser)
      .post("/auth/signin", signIn)
      .post("/gifs", isLoggedIn, postGif)
      .post("/articles", isLoggedIn, postArticle)
      .post("/articles/:articleId/comment", isLoggedIn, commentArticle)
      .post("/gifs/:gifId/comment", isLoggedIn, commentGif)
      .get("/feed", isLoggedIn, getFeed)
      .get("/articles/:articleId", isLoggedIn, getArticle)
      .get("/gifs/:gifId", isLoggedIn, getGif)
      .get("/tags/:tagId", isLoggedIn, getArticleTag)
      .patch("/articles/:articleId", isLoggedIn, editArticle)
      .patch("/flag/articles/:articleId", isLoggedIn, flagArticle)
      .patch("/flag/gifs/:gifId", isLoggedIn, flagGif)
      .patch("/flag/comments/article/:commentId", isLoggedIn, flagArticleComment)
      .patch("/flag/comments/gifId/:commentId", isLoggedIn, flagGifComment)
      .delete("/flag/articles/:articleId", adminRoutes, deleteFlaggedArticle)
      .delete("/flag/gifs/:gifId", adminRoutes, deleteFlaggedGif)
      .delete("/flag/comment/article/:commentId", adminRoutes, deleteFlaggedArticleComment)
      .delete("/flag/comment/gif/:commentId", adminRoutes, deleteFlaggedGifComment)
      .delete("/articles/:articleId", isLoggedIn, deleteArticle)
      .delete("/gifs/:gifId", isLoggedIn, deleteGif)

module.exports = router;