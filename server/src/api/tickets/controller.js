import {TickerModel} from './model'
import _ from 'lodash'


export async function getAllTickets(req , res){
    try{    const docs = await TickerModel.find()
        if(_.isEmpty(docs)){
            return res.status(400).json({success:false  , message:'no tickets'})
        }
        return res.status(200).json({success:true  , message:'tickets' , data:docs})
    }catch(error){   
        return res.status(500).json({success:false  , message:'server error'})
    }
}
    
export async function insertTicker(req, res) { 
  try {
    const { title, description, status, duplicate_id , tags} = req.body;

    const ticket = await TickerModel.create({
      title,
      description,
      status,
      tags,
      duplicate_id
    });

    res.status(201).json({ 
      success: true,
      message: "Ticket created successfully",
      data: ticket 
    });
  } catch (err) {
    console.error("Insert error:", err);
    res.status(500).json({ 
      success: false,
      message: "Server error",
      error: err.message 
    });
  }
}


export async function getTicket(req , res) {
  const id = req.params.id
  return TickerModel.findById(id)
  .then((_res)=>{
    if(_.isEmpty(_res)){
      return res.status(404).json({success:flase , error:'no ticket'})
    }
    return res.status(200).json({success:true , data:_res})
  }).catch((err)=>{
    console.log(`[Error]:== ${err}`)
    return res.status(500).json({ 
      success: false,
      message: "Server error",
      error: err.message 
    });
  })
  
}