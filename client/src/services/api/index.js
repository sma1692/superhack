import axios from "axios"

const baseURL = import.meta.env.VITE_BASEURL_BACKEND
const axiosInstance = axios.create({
    baseURL:baseURL
})


export const getTicketAPI = ()=>{
    return axiosInstance.get('/tickets')
    .then((res)=>{
        return res.data
    })
    .catch((err)=>{throw err})
}
export const getTicketByIdAPI = (id)=>{
    return axiosInstance.get(`/tickets/${id}`)
    .then((res)=>{
        return res.data
    })
    .catch((err)=>{throw err})
} 


export const getTroubleshootingStepsAPI = (id)=>{
    return axiosInstance.get(`/suggestions/chat/${id}`)
    .then((res)=>{
        return res.data
    })
    .catch((err)=>{throw err})
} 

export const getFixStepsAPI = (id)=>{
    return axiosInstance.get(`/fix-steps/chat/${id}`)
     .then((res)=>{
        return res.data
    })
    .catch((err)=>{throw err})
}

export const getClientCommunicationAPI = (ticket_id , fix_steps_id , troubleshooting_id)=>{
    return axiosInstance.post(`/client-coms/chat` , {ticket_id , fix_steps_id , troubleshooting_id})
     .then((res)=>{
        return res.data
    })
    .catch((err)=>{throw err})
}

export const getResolutionAPI = (ticket_id , fix_steps_id , troubleshooting_id)=>{
    return axiosInstance.post(`/resolutions/chat` , {ticket_id , fix_steps_id , troubleshooting_id})
     .then((res)=>{
        return res.data
    })
    .catch((err)=>{throw err})
}

