const express = require("express");
const router = express.Router();
const eventsController = require("../controllers/events.controller");
const auth = require("../middlewares/firebaseAuth");
const {
  validate,
  eventSchema,
  idParamSchema,
} = require("../middlewares/validation");
const { adminLimiter } = require("../middlewares/rateLimiter");

// Public routes
router.get("/", eventsController.getAllEvents);
router.get(
  "/:id",
  validate(idParamSchema, "params"),
  eventsController.getEventById,
);

// Protected admin routes - admin rate limiting
router.post(
  "/",
  auth,
  adminLimiter,
  validate(eventSchema),
  eventsController.createEvent,
);
router.put(
  "/:id",
  auth,
  adminLimiter,
  validate(idParamSchema, "params"),
  validate(eventSchema),
  eventsController.updateEvent,
);
router.delete(
  "/:id",
  auth,
  adminLimiter,
  validate(idParamSchema, "params"),
  eventsController.deleteEvent,
);

module.exports = router;
