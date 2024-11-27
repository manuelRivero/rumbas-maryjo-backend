import { Router } from "express";
import Event from "../../models/events";
import mongoose from "mongoose";

const router = Router();

router.get("/event-detail/:id", async (req, res) => {
  const { id } = req.params;
  console.log('id', id)
  try {
    const targetEvent = await Event.findById(id);
console.log('targetEvent', targetEvent)
    res.json({ ok: true, targetEvent });
  } catch (error) {
    res.status(404).json({ ok: false, error: "No se encontró el evento" });
  }
});

export default router;
