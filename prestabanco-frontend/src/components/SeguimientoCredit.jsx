import React, { useState, useEffect } from 'react';
import usuarioService from "../services/usuario.service";
import { Tabs, Tab, Form, Button, Table, ListGroup, Row, Col, Alert } from 'react-bootstrap';
import { useNavigate } from "react-router-dom";
import solicitudService from '../services/solicitud.service';


const CreditTracking = () => {
    const [selectedTab, setSelectedTab] = useState('solicitar');
    const handleTabSelect = (k) => setSelectedTab(k);
    const [solicitudes, setSolicitudes] = useState([]);
    const [users, setUsers] = useState([]);
    
    const fetchSolicitudes = () => {
        solicitudService.getAll()
            .then((response) => setSolicitudes(response.data))
            .catch((error) => console.error("Error al obtener solicitudes:", error));
    };
    
    const fetchUsers = async () => {
      usuarioService.getAll().then((response) => {
          setUsers(response.data);
          console.log("se encontraron los Usuarios.");
      })
      .catch((error) => {
      console.log(
        "Ha ocurrido un error al entregar los usuarios.",
        error
      );
      });
    };

    useEffect(() => {
        fetchSolicitudes();
        fetchUsers();
    }, []);

    // Función para manejar el envío exitoso de una solicitud
    const handleSuccessfulSubmission = () => {
        fetchSolicitudes(); // Actualiza las solicitudes
        setSelectedTab("proceso"); // Cambia a la pestaña de créditos en proceso
    };
    return (
        <div className="container mt-4">
            <h2>Seguimiento de Crédito</h2>
            <Tabs activeKey={selectedTab} onSelect={handleTabSelect} className="mb-3">
                <Tab eventKey="solicitar" title="Solicitar Crédito">
                    <SolicitudCreditoForm onSuccessfulSubmit={handleSuccessfulSubmission} />
                </Tab>
                <Tab eventKey="proceso" title="Créditos en Proceso">
                    <CreditosEnProceso solicitudes={solicitudes} fetchSolicitudes={fetchSolicitudes}  />
                </Tab>
            </Tabs>
        </div>
    );
};

const SolicitudCreditoForm = ({onSuccessfulSubmit}) => {
    const [users, setUsers] = useState([]);
    const [formData, setFormData] = useState({
        correo: "",
        telefono: "",
        nombreArchivos: [],
        documentos: [],
        tipoPrestamo: "",
        antiguedadTrabajo: "",
        tipoTrabajo: "",
        valorPropiedad: "",
        ingresosMensuales: [],
        deudasMensuales: [],
        estado: "En Revisión Inicial",
        usuario: ""
      });

      const [showAlert, setShowAlert] = useState(false);

      const [ingresosMensuales, setIngresosMensuales] = useState(Array(12).fill(0));
      const [deudasMensuales, setDeudasMensuales] = useState(Array(12).fill(0));

      const requiredFilesConfig = {
        "Primera Vivienda": 3,
        "Segunda Vivienda": 4,
        "Propiedades Comerciales": 4,
        "Remodelación": 3,
      };


    const handleChange = (e) => {
        const { name, value } = e.target;
        let formattedValue;
        switch (name) {
            case "telefono":
                // Limitar el teléfono a 9 dígitos y eliminar caracteres no numéricos
                formattedValue = value.replace(/^0+/g, '').replace(/\D/g, '').slice(0, 9);
                break;
            case "valorPropiedad":
              formattedValue = formatNumber(value);
              break;
            case "antiguedadTrabajo":
              formattedValue = value.replace(/^0+/g, '').replace(/\D/g, '').slice(0, 2); // Limitar a 2 dígitos
              if (parseInt(value, 10) > 70) {
                  formattedValue = "70"; // Limitar el máximo a 70
              }
              break;
            default:
                formattedValue = value;
        }
        setFormData((prevData) => ({
          ...prevData,
          [name]: formattedValue,
        }));
      };
      
      const formatNumber = (number) => {
        if (typeof number !== 'string') {
          number = number.toString(); // Ensure number is treated as a string
        }
      
        // Remove any non-digit characters
        const cleanNumber = number.replace(/\D/g, '');
      
        if (cleanNumber.startsWith('0')) {
          return cleanNumber.replace(/^0+/, '').replace(/\B(?=(\d{3})+(?!\d))/g, "."); // Remove leading zeros
        }
        // Regular expression to add dots
        return cleanNumber.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
      };
      const handleUserSelect = (userId) => {
        console.log("Los usuarios son", users)
        console.log("Los usuarios son", userId.target.value)
        if (userId.target.value === '') {
          // Si el valor es vacío, no hacemos nada.
          return;
      }
        const selectedUser = users.find((user) => user.nombre === userId.target.value);
        console.log("el usuario Elegido es", selectedUser)
        setFormData((prevData) => ({
            ...prevData,
            usuario: selectedUser, // Guarda el objeto completo del usuario o un objeto vacío si no se encuentra
        }));
    };

    const handleFileChange = (e, index) => {
        const file = e.target.files[0];
        const reader = new FileReader();
    
        reader.onload = (e) => {
            console.log("Bytes del archivo:", e.target.result);
            const fileBase64 = e.target.result;

            setFormData((prevData) => {
                const updatedDocumentos = [...prevData.documentos];
                const updatedNombreArchivos = [...prevData.nombreArchivos];
        
                // Insertar el archivo en la posición especificada
                updatedDocumentos[index] = fileBase64;
                updatedNombreArchivos[index] = file.name;

                const allFilesComplete = updatedDocumentos.every((doc) => doc !== null);

                return {
                ...prevData,
                documentos: updatedDocumentos,
                nombreArchivos: updatedNombreArchivos,
                estado: allFilesComplete ? "En Revisión Inicial" : "Pendiente de documentacion",
                };
        });
        };
        reader.readAsDataURL(file);
      };

      const handleIngresosChange = (index, value) => {
        const updatedIngresos = [...ingresosMensuales];
        value = formatNumber(value);
        updatedIngresos[index] = value;
        setIngresosMensuales(updatedIngresos);
        setFormData({
          ...formData,
          ingresosMensuales: updatedIngresos
        });
      };

      const handleDeudasChange = (index, value) => {
        const updatedDeudas = [...deudasMensuales];
        value = formatNumber(value);
        updatedDeudas[index] = value;
        setDeudasMensuales(updatedDeudas);
        setFormData({
          ...formData,
          deudasMensuales: updatedDeudas
        });
      };

      const handleTipoPrestamoChange = (e) => {
        const tipoPrestamo = e.target.value;
    
        
        const requiredLength = requiredFilesConfig[tipoPrestamo] || 0;
    
        console.log("Largo de la lista de documentos es:", requiredLength)
        setFormData((prevData) => ({
          ...prevData,
          tipoPrestamo,
          documentos: Array(requiredLength).fill(null),
          nombreArchivos: Array(requiredLength).fill(null),
          estado: "Pendiente de documentacion", // Reinicia el estado cada vez que se cambia el tipo
        }));
      };

      const renderMonthlyFields = (type, values, onChangeHandler) => {
        return (
          <Row className="mb-3">
            {values.map((value, index) => (
              <Col xs={3} sm={3} md={3} lg={3} key={`${type}-${index}`} className="mb-2">
                <Form.Control
                  placeholder={`Mes ${index + 1}`}
                  value={value === 0 ? "" : value}
                  onChange={(e) => onChangeHandler(index, e.target.value)}
                />
              </Col>
            ))}
          </Row>
        );
      };
      

      const handleSubmit = async (e) => {
        e.preventDefault();

        if (formData.telefono.length < 8) {
          setShowAlert(true);
          window.scrollTo({ top: 0, behavior: 'smooth' }); // Scroll al inicio con comportamiento suave
        } else {
          setShowAlert(false);
          const cleanedData = {
            ...formData,
            telefono: formData.telefono.replace(/\./g, ""), // Eliminar puntos del teléfono
            valorPropiedad: formData.valorPropiedad.replace(/\./g, ""), // Eliminar puntos del valorPropiedad
            ingresosMensuales: formData.ingresosMensuales.map(ingreso => {
                return parseInt(ingreso.toString().replace(/\./g, "")); // Parsear como número entero
            }), // Eliminar puntos y convertir a número entero
            deudasMensuales: formData.deudasMensuales.map(deuda => {
              return parseInt(deuda.toString().replace(/\./g, "")); // Eliminar puntos
            })
          };
          const hasNullDocument = formData.documentos.some((file) => file === null);
          if (hasNullDocument) {
            // Mostrar ventana de confirmación si hay documentos nulos
            if (window.confirm("Hay documentos faltantes, no se podrá continuar con la solicitud. ¿Estás seguro de que deseas enviar la solicitud?")) {
              console.log(cleanedData);
              solicitudService.create(cleanedData).then((response)=> {
                setFormData({
                    correo: "",
                    telefono: "",
                    nombreArchivos: [],
                    documentos: [],
                    tipoPrestamo: "",
                    antiguedadTrabajo: "",
                    tipoTrabajo: "",
                    valorPropiedad: "",
                    ingresosMensuales: [],
                    deudasMensuales: [],
                    estado: "En Revisión Inicial",
                    usuario: ""
                });

                setIngresosMensuales(Array(12).fill(0));
                setDeudasMensuales(Array(12).fill(0));

                if (onSuccessfulSubmit) {
                  alert("Solicitud Creada Exitósamente")
                    onSuccessfulSubmit(); // Llama a la función de éxito
                }
              }).catch((error) => {
                console.log(
                "Ha ocurrido un error al intentar generar la simulacion.",
                error
                );
                });
              }
            }
          }
      };



      

    useEffect(() => {
        const fetchUsers = async () => {
            usuarioService.getAll().then((response) => {
                console.log("se encontraron los Usuarios.", response.data);
                setUsers(response.data);
            })
            .catch((error) => {
            console.log(
            "Ha ocurrido un error al entregar los usuarios.",
            error
            );
            });
        };
        fetchUsers();
      }, []);

    return (
      <div>
      {showAlert && (
        <Alert
          variant="warning"
          onClose={() => setShowAlert(false)} // Close alert on dismiss
          dismissible
        >
          Formulario incorrecto. Revisar campos del formulario.
        </Alert>
      )}
        <Form onSubmit={handleSubmit}>
            <h4>Datos del Cliente</h4>
            <Form.Group controlId="formName">
                <Form.Label>Cliente Solicitante</Form.Label>
                <Form.Control 
                as="select" 
                name="usuario" 
                value={formData.usuario?.nombre} 
                onChange={handleUserSelect}
                required
                >
                    <option value="">Seleccione un usuario</option>
                    {users.map((user) => (
                    <option key={user.id} value={user.nombre}>
                        {user.nombre}
                    </option>
                    ))}
                </Form.Control>
            </Form.Group>
            
            <Form.Group controlId="formEmail">
                <Form.Label>Email</Form.Label>
                <Form.Control 
                type="email"
                name="correo"
                value={formData.correo}
                onChange={handleChange}
                placeholder="example@domain.com" 
                isInvalid={showAlert && !formData.correo} />
                <Form.Control.Feedback type="invalid">
                  Por favor, ingresa un correo válido.
                </Form.Control.Feedback>
            </Form.Group>

            <Form.Group controlId="formPhone">
                <Form.Label>Número de teléfono</Form.Label>
                <Form.Control 
                type="number"
                name="telefono"
                value={formData.telefono}
                onChange={handleChange}
                placeholder="Ej: 9 4261 1252"
                isInvalid={showAlert && formData.telefono.length < 8}/>
                <Form.Control.Feedback type="invalid">
                  Por favor, ingresa un número válido.
                </Form.Control.Feedback>
            </Form.Group>

            <Form.Group controlId="formTrabajo">
                <Form.Label>Tipo de Trabajo</Form.Label>
                <Form.Control as="select" name="tipoTrabajo" value={formData.tipoTrabajo} onChange={handleChange} required >
                    <option value="">Seleccione...</option>
                    <option>Independiente</option>
                    <option>Dependiente</option>
                </Form.Control>
            </Form.Group>
            
            <Form.Group controlId="formAntiguedad">
                <Form.Label>Años de antiguedad Trabajando</Form.Label>
                <Form.Control 
                  name="antiguedadTrabajo"
                  value={formData.antiguedadTrabajo}
                  onChange={handleChange}/>
                <Form.Control.Feedback type="invalid">
                  Por favor, ingresa una antiguedad de trabajo entre 1 a 70.
                </Form.Control.Feedback>
            </Form.Group>

            <h4 className="mt-4">Tipo de Préstamo</h4>
            <Form.Group controlId="formLoanType">
                <Form.Label>Selecciona el Tipo de Préstamo</Form.Label>
                <Form.Control as="select" name="tipoPrestamo" value={formData.tipoPrestamo} onChange={handleTipoPrestamoChange} required>
                <option value="">Seleccione...</option>
                    <option>Primera Vivienda</option>
                    <option>Segunda Vivienda</option>
                    <option>Propiedades Comerciales</option>
                    <option>Remodelación</option>
                </Form.Control>
            </Form.Group>

            {formData.tipoPrestamo === "Primera Vivienda" && (
                
                <><h4 className="mt-4">Archivos Necesarios</h4>
                    <Form.Group controlId="formFile1">
                        <Form.Label>Comprobante de Ingresos</Form.Label>
                        <Form.Control type="file" onChange={(e) => handleFileChange(e, 0)} />
                    </Form.Group>
                    <Form.Group controlId="formFile2">
                        <Form.Label>Certificado de Avalúo</Form.Label>
                        <Form.Control type="file" onChange={(e) => handleFileChange(e, 1)} />
                    </Form.Group>
                    <Form.Group controlId="formFile3">
                        <Form.Label>Historial Crediticio</Form.Label>
                        <Form.Control type="file" onChange={(e) => handleFileChange(e, 2)} />
                    </Form.Group>
                </>
            )}

            {formData.tipoPrestamo === "Segunda Vivienda" && (
                <><h4 className="mt-4">Archivos Necesarios</h4>
                    <Form.Group controlId="formFile1">
                        <Form.Label>Comprobante de Ingresos</Form.Label>
                        <Form.Control type="file" onChange={(e) => handleFileChange(e, 0)} />
                    </Form.Group>
                    <Form.Group controlId="formFile2">
                        <Form.Label>Certificado de Avalúo</Form.Label>
                        <Form.Control type="file" onChange={(e) => handleFileChange(e, 1)}/>
                    </Form.Group>
                    <Form.Group controlId="formFile3">
                        <Form.Label>Escritura de la Primera Vivienda</Form.Label>
                        <Form.Control type="file" onChange={(e) => handleFileChange(e, 2)}/>
                    </Form.Group>
                    <Form.Group controlId="formFile4">
                        <Form.Label>Historial Crediticio</Form.Label>
                        <Form.Control type="file" onChange={(e) => handleFileChange(e, 3)}/>
                    </Form.Group>
                </>
            )}

            {formData.tipoPrestamo === "Propiedades Comerciales" && (
                <><h4 className="mt-4">Archivos Necesarios</h4>
                    <Form.Group controlId="formFile1">
                        <Form.Label>Estado financiero del negocio</Form.Label>
                        <Form.Control type="file" onChange={(e) => handleFileChange(e, 0)}/>
                    </Form.Group>
                    <Form.Group controlId="formFile2">
                        <Form.Label>Comprobante de Ingresos</Form.Label>
                        <Form.Control type="file" onChange={(e) => handleFileChange(e, 1)}/>
                    </Form.Group>
                    <Form.Group controlId="formFile3">
                        <Form.Label>Certificado de Avalúo</Form.Label>
                        <Form.Control type="file" onChange={(e) => handleFileChange(e, 2)}/>
                    </Form.Group>
                    <Form.Group controlId="formFile4">
                        <Form.Label>Plan de negocios</Form.Label>
                        <Form.Control type="file" onChange={(e) => handleFileChange(e, 3)}/>
                    </Form.Group>
                </>
            )}
            {formData.tipoPrestamo === "Remodelación" && (
                <><h4 className="mt-4">Archivos Necesarios</h4>
                    <Form.Group controlId="formFile1">
                        <Form.Label>Comprobante de Ingresos</Form.Label>
                        <Form.Control type="file" onChange={(e) => handleFileChange(e, 0)} />
                    </Form.Group>
                    <Form.Group controlId="formFile2">
                        <Form.Label>Presupuesto de la remodelación</Form.Label>
                        <Form.Control type="file" onChange={(e) => handleFileChange(e, 1)}/>
                    </Form.Group>
                    <Form.Group controlId="formFile3">
                        <Form.Label>Certificado de avalúo actualizado</Form.Label>
                        <Form.Control type="file" onChange={(e) => handleFileChange(e, 2)}/>
                    </Form.Group>
                </>
            )}
            <Form.Group controlId="formValue">
                <Form.Label>Valor Propiedad</Form.Label>
                <Form.Control 
                name="valorPropiedad"
                value={formData.valorPropiedad}
                onChange={handleChange}
                placeholder="Valor de la propiedad a solicitar" 
                required/>
            </Form.Group>
            <div className="col-auto my-1 d-flex flex-column">
              <h4 className="mt-4">Ingresos Mensuales</h4>
              <h7 className="mt-4">Partiendo desde las ganancias de hace un año exacto hasta el mes actual</h7>
              {renderMonthlyFields("ingreso", ingresosMensuales, handleIngresosChange)}

              <h4 className="mt-4">Deudas Mensuales</h4>
              <h7 className="mt-4">Partiendo desde las deudas hace un año exacto hasta el mes actual (No acumulada)</h7>
              {renderMonthlyFields("deuda", deudasMensuales, handleDeudasChange)}
              <h4 className="mt-4">Recordar las posibles comisiones extra del Banco que se aplicarán a su préstamo</h4>
              <Form.Group controlId="formExtraValue1">
                  <Form.Label>Seguro de degravamen</Form.Label>
                  <Form.Control type="text" placeholder="Gratis o hasta un máximo de 3% añadido al monto de pago mensual" disabled />
              </Form.Group>
              <Form.Group controlId="formExtraValue2">
                  <Form.Label>Seguro de Incendio</Form.Label>
                  <Form.Control type="text" placeholder="A partir de $3.000 mensual hasta $80.000" disabled />
              </Form.Group>
              <Form.Group controlId="formExtraValue3">
                  <Form.Label>Costo Administración</Form.Label>
                  <Form.Control type="text" placeholder="Partiendo de 0,1% mensual, sujeto a cambios dependiendo de gastos operacionales" disabled />
              </Form.Group>
            </div>
            <Button variant="primary" type="submit" className="mt-3">
                Enviar Solicitud
            </Button>
        </Form>
        </div>
    );
};

const CreditosEnProceso = ({ solicitudes, fetchSolicitudes }) => {
    const navigate = useNavigate();
    const [usuariosCache, setUsuariosCache] = useState({});
    const handleDelete = async (id) => {
        try {
            await solicitudService.remove(id);
            console.log("Solicitud Eliminada con éxito");
            solicitudService.getAll().then((response) =>{
                fetchSolicitudes(response.data);
              });
        } catch (error) {
            console.error("Error al eliminar el usuario:", error);
        }
    };

    const handleRechazarCliente = (solicitud) => {
      if (window.confirm("¿Desea cancelar su solicitud? Esto no se puede deshacer")){
      const solicitudActualizada = { ...solicitud, estado: "Cancelada Por el Cliente" };
          solicitudService.update(solicitudActualizada).then(() => {
            solicitudService.getAll().then((response) =>{
              fetchSolicitudes(response.data);
            });
          });
        }
    };
      return (
        <div>
          <h4>Créditos en Proceso</h4>
          <p>Aquí puedes ver el estado de tus créditos en proceso.</p>
          <Table striped bordered hover responsive className="table-sm">
            <thead>
              <tr>
                <th>Número Solicitud</th>
                <th>Nombre Solicitante</th>
                <th>Tipo Préstamo</th>
                <th>Valor Propiedad</th>
                <th>Estado</th>
                <th>Documentos Enviados</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {solicitudes.map((solicitud) => (
                <tr key={solicitud.id}>
                  <td>N°{solicitud.id}</td>
                  <td>{solicitud.usuario.nombre}</td>
                  <td>{solicitud.tipoPrestamo}</td>
                  <td>${solicitud.valorPropiedad}</td>
                  <td>{solicitud.estado}</td>
                  <td>
                  {solicitud.nombreArchivos.length > 0 ? (
                    <ListGroup variant="flush">
                      {solicitud.documentos.map((file, index) => (
                        <ListGroup.Item
                          key={index}
                          className="d-flex justify-content-between align-items-center p-1"
                        >
                          <span>{solicitud.nombreArchivos[index]}</span>
                          <Button
                            variant="outline-primary"
                            href={file} // La URL del archivo para descargar
                            download={solicitud.nombreArchivos[index]} // Forzar la descarga con el nombre del archivo
                            size="sm"
                          >
                            Descargar
                          </Button>
                        </ListGroup.Item>
                      ))}
                    </ListGroup>
                ) : (
                  <p className="text-muted">No se han enviado documentos</p>
                )}
                  </td>
                  <td>
                    {solicitud.estado === "Rechazada" || solicitud.estado === "Cancelada Por el Cliente" ? (
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleDelete(solicitud.id)}
                      >
                        Eliminar Solicitud
                      </Button>
                    ) : (
                      <Button
                        variant="warning"
                        size="sm"
                        onClick={() => handleRechazarCliente(solicitud)}
                      >
                        Cancelar Solicitud
                      </Button>
                    )}
                    <Button
                      variant="success"
                      size="sm"
                      onClick={() => navigate(`/evaluar-solicitud/${solicitud.id}`)}
                    >
                      Evaluar Solicitud
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      );
    };


export default CreditTracking;
