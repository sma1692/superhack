import mongoose , {Schema , Types}  from 'mongoose'



export const suggestionSchema = new Schema({
  ticket_id: { type: Schema.Types.ObjectId, required: true , refs:'tickets' },
  suggestion: { type: String, required: true },
  status: { type: Number, required: true },
  llm:{type:Schema.Types.Mixed , required:true},
  promptVersion:{type:Schema.Types.Number , required:true , default:1}
}, { timestamps: true });

export const SuggestionsModel = mongoose.model('Suggestions' , suggestionSchema)


