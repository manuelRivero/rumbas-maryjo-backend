import { Schema, model } from "mongoose";

const Ticket = new Schema(
  {
    name: { type: String },
    dni: { type: String },
    email: { type: String },
    eventId: {
      type: Schema.Types.ObjectId,
      ref: "Event",
      required: true,
    },
    tickets: [
      {
        status: { type: String, enum: ["active", "inactive"], required: true },
      },
    ],
  },

  {
    collection: "tickets",
    timestamps: true,
  }
);

export default model("Ticket", Ticket);
