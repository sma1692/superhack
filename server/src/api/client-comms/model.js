import mongoose , {Schema , Types}  from 'mongoose'


export const clientCommsSchema = new Schema({
  ticket_id: { type: Schema.Types.ObjectId, required: true },
  comms: [{ type: Schema.Types.String, required: true }], 
  status: { type: Number, required: true , default:1},
  tone: { type: Number, default: 0 },
  promptVerison:{type:Number , default:1},
  llm:{type:Schema.Types.Mixed}
}, { timestamps: true });


export const ClientCommModel = mongoose.model('ClientCommunication' , clientCommsSchema)


