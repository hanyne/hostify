import './App.css';
import Home from './pages/Home';
import {
  BrowserRouter as Router,
  Routes,
  Route,
} from "react-router-dom";
import Login from './pages/Login';
import Inscription from './pages/Inscription';
import ForgotPassword from './pages/ForgetPassword';
import ResetPassword from './pages/ResetPassword';
import Contact from './pages/Contact';
import Dashboard from './pages/Dashboard';
import DomainReservations from './pages/DomainReservations';
import Offers from './pages/Offers';
function App() {
  return (
    <Router>
    <Routes>
        <Route exact path="/home" element={<Home/>}/>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Inscription />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/offers" element={<Offers />} /> {/* Nouvelle route */}
        <Route path="/domain-reservations" element={<DomainReservations isAdmin={false} />} />
        <Route path="/" element={<Login />} /> {/* Page par défaut */}
    </Routes>
    </Router>
  );
}

export default App;
