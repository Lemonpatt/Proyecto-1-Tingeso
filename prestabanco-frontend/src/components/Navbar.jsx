import * as React from "react";

import { Navbar, Nav, Offcanvas, Button, Container } from "react-bootstrap";
import { FaTable } from "react-icons/fa";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function NewNavbar() {
  const [show, setShow] = useState(false);
  const navigate = useNavigate();
  const toggleDrawer = () => {
    setShow(!show);
  };

  return (
      <>
        <Navbar bg="dark" variant="dark" expand="lg" style={{ backgroundColor: "#ffffff" }} fixed="top">
          <Container>
          <Button 
              variant="secondary" 
              onClick={() => navigate("")} 
              className="position-absolute" 
              style={{ left: "15px" }}
            >Inicio</Button>
            <Button variant="primary" onClick={toggleDrawer} className="position-absolute" style={{ left: "100px" }}>
              <FaTable  />
            </Button>
            <Nav className="text-white, position-absolute" style={{ marginLeft: "-140px" }}>
              <span style={{ color: "#ffffff"}}> {'<-- '}Funcionalidades</span>
            </Nav>
            <Navbar.Brand className="mx-auto" href="" style={{fontWeight: "bold" }}>
              Prestabanco: Sistema de Gestión de Crédito
            </Navbar.Brand>
          </Container>
        </Navbar>

        <Offcanvas show={show} onHide={toggleDrawer} placement="start">
          <Offcanvas.Header closeButton>
            <Offcanvas.Title>Menu</Offcanvas.Title>
          </Offcanvas.Header>
          <Offcanvas.Body>
          <Nav className="flex-column">
          <Nav.Item>
            <Nav.Link onClick={() => navigate("/prestamo/simulacion")}>Simular Crédito</Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link onClick={() => navigate("/usuarios")}>Registro Usuario</Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link onClick={() => navigate("/prestamo/seguimiento")}>Solicitud y Seguimiento Créditos</Nav.Link>
          </Nav.Item>
        </Nav>
          </Offcanvas.Body>
        </Offcanvas>
    </>
  );
}
