import { Schema, model } from "mongoose";

const Ticket= new Schema(
  {
    name:{ type: String },
    dni: {type: String},
    email:{type:String},
    tickets: [
        {
            event: { type: Schema.Types.ObjectId, ref: "Event" },
            price:{type:String},
            dateStart:{type: Date},
            dateEnd:{type: Date},
        }
    ]
},
    
  {
    collection: "tickets",
    timestamps: true,
  }
);

export default model("Ticket", Ticket);