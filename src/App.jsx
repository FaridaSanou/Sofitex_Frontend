import { BrowserRouter, Routes, Route } from "react-router-dom"
<<<<<<< HEAD
import Login from "./pages/Login"
import CreateAccount from "./pages/CreateAccount"
import AdminDashboard from "./pages/AdminDashboard"
import DpoDashboard from "./pages/DpoDashboard"
import CilDashboard from "./pages/CilDashboard"
import DgDashboard from "./pages/DgDashboard"
import UtilisateurMetierDashboard from "./pages/UtilisateurMetierDashboard"
=======
import Login          from "./pages/Login"
import CreateAccount  from "./pages/CreateAccount"
import AdminDashboard from "./pages/AdminDashboard"
>>>>>>> 81803c9cd3822b0eeaf74697cef85bee78db2d9e

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
<<<<<<< HEAD
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<CreateAccount />} />
        <Route path="/dashboard" element={<AdminDashboard />} />
        <Route path="/dpo" element={<DpoDashboard />} />
        <Route path="/" element={<DpoDashboard />} />
        <Route path="/cil" element={<CilDashboard />} />
        <Route path="/dg" element={<DgDashboard />} />
        <Route path="/metier" element={<UtilisateurMetierDashboard />} />
=======
        <Route path="/"               element={<Login />} />
        <Route path="/login"          element={<Login />} />
        <Route path="/register"       element={<CreateAccount />} />
        <Route path="/AdminDashboard" element={<AdminDashboard />} />
>>>>>>> 81803c9cd3822b0eeaf74697cef85bee78db2d9e
      </Routes>
    </BrowserRouter>
  )
}
