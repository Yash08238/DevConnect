const express = require("express");
const router = express.Router();
const jobController = require("../controllers/job.controller");
const validate = require("../middleware/validate");
const { authenticate } = require("../middleware/auth");
const { uploadSingle } = require("../middleware/upload");
const { createJobValidation } = require("../validators/job.validator");

router.route("/")
  .post(authenticate, uploadSingle("logo"), validate(createJobValidation), jobController.createJob)
  .get(jobController.getJobs);

router.get("/:id", jobController.getJob);
router.post("/:id/apply", authenticate, jobController.applyJob);

module.exports = router;
