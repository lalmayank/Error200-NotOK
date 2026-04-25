import { Routes, Route } from 'react-router'
import LandingPage from './pages/LandingPage'
import LucidaApp from './pages/LucidaApp'
import Login from "./pages/Login"
import NotFound from "./pages/NotFound"

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/app" element={<LucidaApp />} />
      <Route path="/login" element={<Login />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}