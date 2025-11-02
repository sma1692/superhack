import mongoose,{ Schema, Types } from "mongoose";



export const ticketSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  status: { type: Number, required: true }, // 0-active 1-duplicate 2-resolved 3-cancelled
  duplicate_id: { type: Schema.Types.ObjectId, default: null },
  tags:{type:Schema.Types.Array , default:[]}
}, { timestamps: true });


export const TickerModel  = mongoose.model('Ticket' , ticketSchema)
