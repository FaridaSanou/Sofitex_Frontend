import { BrowserRouter, Routes, Route } from "react-router-dom"
import Login          from "./pages/Login"
import CreateAccount  from "./pages/CreateAccount"
import AdminDashboard from "./pages/AdminDashboard"

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"               element={<Login />} />
        <Route path="/login"          element={<Login />} />
        <Route path="/register"       element={<CreateAccount />} />
        <Route path="/AdminDashboard" element={<AdminDashboard />} />
      </Routes>
    </BrowserRouter>
  )
}