import { BrowserRouter, Routes, Route } from "react-router-dom"
import Login from "./pages/Login"
import CreateAccount from "./pages/CreateAccount"
import ForgotPassword from "./pages/ForgotPassword"
import AdminDashboard from "./pages/AdminDashboard"
import DpoDashboard from "./pages/DpoDashboard"
import CilDashboard from "./pages/CilDashboard"
import DgDashboard from "./pages/DgDashboard"
import UtilisateurMetierDashboard from "./pages/UtilisateurMetierDashboard"
import PageDonneesTraitement from "./pages/PageDonneesTraitement"
import Inactif from "./pages/page_inactif"
import VerificationGuard from "./components/VerificationGuard"

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<CreateAccount />} />
        <Route path="/mot-de-passe-oublie" element={<ForgotPassword />} />
        <Route path="/dashboard" element={<VerificationGuard><AdminDashboard /></VerificationGuard>} />
        <Route path="/dpo" element={<VerificationGuard><DpoDashboard /></VerificationGuard>} />
        <Route path="/cil" element={<VerificationGuard><CilDashboard /></VerificationGuard>} />
        <Route path="/dg" element={<VerificationGuard><DgDashboard /></VerificationGuard>} />
        <Route path="/metier" element={<VerificationGuard><UtilisateurMetierDashboard /></VerificationGuard>} />
        <Route path="/traitements/:id/donnees" element={<VerificationGuard><PageDonneesTraitement /></VerificationGuard>} />
        <Route path="/compte-inactif" element={<Inactif />}/>
      </Routes>
    </BrowserRouter>
  )
}