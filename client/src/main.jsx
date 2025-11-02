import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter, Route, Routes } from 'react-router'
import Tickets from './pages/Tickets.jsx'
import TicketDetail from './pages/TicketDetails.jsx'

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <Routes>
            <Route path="/" element={<Tickets />} />
            <Route path="/tickets/:id" element={<TicketDetail />} />
    </Routes>
  </BrowserRouter>

)
