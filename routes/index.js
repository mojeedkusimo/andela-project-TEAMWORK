const router = require("express").Router();
const { createUser, signIn } = require("../controllers/");
const { adminRoutes } = require("../middlewares")

router.post("/auth/create-user", adminRoutes, createUser)
      .post("/auth/signin", signIn);

module.exports = router;