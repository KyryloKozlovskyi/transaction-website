const express = require("express");
const router = express.Router();
const eventsController = require("../controllers/events.controller");
const auth = require("../../middlewares/firebaseAuth");

// Public routes
router.get("/", eventsController.getAllEvents);
router.get("/:id", eventsController.getEventById);

// Protected routes
router.post("/", auth, eventsController.createEvent);
router.put("/:id", auth, eventsController.updateEvent);
router.delete("/:id", auth, eventsController.deleteEvent);

module.exports = router;
