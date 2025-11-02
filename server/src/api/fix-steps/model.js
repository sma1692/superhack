import mongoose , {Schema , Types}  from 'mongoose'


export const fixStepsSchema = new Schema({
  ticket_id: { type: Schema.Types.ObjectId, required: true },
  steps: [{ type: Schema.Types.String, required: true }], 
  status: { type: Number, required: true },
  llm:{type:Schema.Types.Mixed},
  promptVersion:{type:Schema.Types.Number , default:1}
}, { timestamps: true });


export const FixStepsModel = mongoose.model('FixSteps' , fixStepsSchema)


