import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import {BrowserRouter as Router, Route, Routes} from 'react-router-dom'
import Home from './components/Home.jsx';
import NewNavbar from './components/Navbar.jsx';
import Simulation from './components/Simulation.jsx';
import UserTable from './components/Registro.jsx';
import Preview from './components/Preview.jsx';
import Seguimiento from './components/SeguimientoCredit.jsx';
import SolicitudDetalle from './components/SolicitudEvaluar.jsx';

function App() {
    return (
        <Router>
            <NewNavbar></NewNavbar>
            <div className="container">
                <Routes>
                    <Route path="/" element={<Home/>} />
                    <Route path="/prestamo/simulacion" element={<Simulation/>} />
                    <Route path="/usuarios" element={<UserTable/>} />
                    <Route path="/preview/:userId" element={<Preview />} />
                    <Route path="/prestamo/seguimiento" element={<Seguimiento />} />
                    <Route path="/evaluar-solicitud/:id" element={<SolicitudDetalle />} />
                </Routes>
            </div>
        </Router>
    );
}

export default App
