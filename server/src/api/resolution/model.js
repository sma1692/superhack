import mongoose , {Schema , Types}  from 'mongoose'



export const resolutionSchema = new Schema({
    ticket_id:{type:Schema.Types.ObjectId , required:true , refs:'tickets'},
    resolution:{type:String , required:true},
    status:{type:Number ,},
    rating:{type:Number , },
    method:{type:Number ,},
    llm:{type:Schema.Types.Mixed},
    promptVersion:{type:Number , default:1}
},{timestamps:true}) 


export const ResolutionModel = mongoose.model('Resolution' , resolutionSchema)


