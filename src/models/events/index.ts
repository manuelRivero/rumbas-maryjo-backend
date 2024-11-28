import { Schema, model } from "mongoose";

const Event= new Schema(
  {
    name:{ type: String },
    description: {type: String},
    startTime:{type:String},
    startDate: {type:Date},
    endTime: {type: String},
    endDate: {type: Date},
    price: {type: Number},
    address: {type: String}
},
    
  {
    collection: "events",
    timestamps: true,
  }
);

export default model("Event", Event);