const router = require("express").Router();
const controllers = require("../controllers");

router.post("/auth/create-user", controllers.createUser)
      .post("auth/signin", controllers.signIn);

module.exports = router;