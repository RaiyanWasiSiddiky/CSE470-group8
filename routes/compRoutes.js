const express = require('express');
const compController = require('../controllers/compController')
const router = express.Router();

router.get("/", compController.get_home);
router.get("/competition.ejs", compController.get_comp);
router.get("/questions.ejs" , compController.get_quest);
router.get("/createaccount.ejs" , compController.get_createacc);
router.get("/index.ejs", compController.get_login);

router.post("/home", compController.post_home);
router.post("/question", compController.post_question);
router.post("/createaccount", compController.post_account);
router.post("/authenticate", compController.post_auth);
router.post("/authenticate-to-admin", compController.post_admin_auth);
router.post("/approve", compController.post_approve);
router.post("/participate", compController.post_participate);
router.post("/createcompetition", compController.post_create_comp);
router.post("/setquestion", compController.post_setques);
router.post("/addques", compController.post_addques);
router.post("/submit_questions", compController.post_submitques);
router.post("/view-competition", compController.post_viewcomp);
router.post("/rate", compController.post_rate);
router.post("/submit-review", compController.post_subrev);
router.post("/profilepage", compController.post_prof);
router.post("/judge", compController.post_judge);
router.post('/vote-for-submission', compController.post_votesub);
router.post("/declare-winner", compController.post_decwin);

module.exports = router;