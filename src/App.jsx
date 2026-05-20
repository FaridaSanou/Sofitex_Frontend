import { BrowserRouter, Routes, Route } from "react-router-dom"
import Login from "./pages/Login"
import CreateAccount from "./pages/CreateAccount"

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<CreateAccount />} />
      </Routes>

    </BrowserRouter>
  )
}