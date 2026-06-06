import { BrowserRouter, Routes, Route } from "react-router-dom"
import Login from "./pages/Login"
import CreateAccount from "./pages/CreateAccount"
import AdminDashboard from "./pages/AdminDashboard"
import DpoDashboard from "./pages/DpoDashboard"
import CilDashboard from "./pages/CilDashboard"
import DgDashboard from "./pages/DgDashboard"
import UtilisateurMetierDashboard from "./pages/UtilisateurMetierDashboard"
import Inactif from "./pages/page_inactif"

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<CreateAccount />} />
        <Route path="/dashboard" element={<AdminDashboard />} />
        <Route path="/dpo" element={<DpoDashboard />} />
        {/* <Route path="/" element={<DpoDashboard />} /> */}
        <Route path="/cil" element={<CilDashboard />} />
        <Route path="/dg" element={<DgDashboard />} />
        <Route path="/metier" element={<UtilisateurMetierDashboard />} />
        <Route path="/compte-inactif" element={<Inactif />}/>
      </Routes>
    </BrowserRouter>
  )
}