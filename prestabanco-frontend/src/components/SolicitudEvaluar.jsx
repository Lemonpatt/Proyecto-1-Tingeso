import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import solicitudService from "../services/solicitud.service";
import usuarioService from "../services/usuario.service";
import { Tabs, Tab, Form, Button, Table, ListGroup, Row, Col } from 'react-bootstrap';

const SolicitudDetalle = () => {
    const { id } = useParams();
    const [solicitud, setSolicitud] = useState(null);
    const [usuario, setUsuario] = useState([]);
    const [evaluacion, setEvaluacion] = useState(null);
    const [totalCost, setTotalCost] = useState(null);
    const [seguimiento, setSeguimiento] = useState([]);
    const configuracionPorTipo = {
        "Primera Vivienda": {
            maxFinanciamiento: 80,
            rangoInteres: [3.5, 5.0],
            plazoMax: 30,
        },
        "Segunda Vivienda": {
            maxFinanciamiento: 70,
            rangoInteres: [4.0, 6.0],
            plazoMax: 20,
        },
        "Comercial": {
            maxFinanciamiento: 60,
            rangoInteres: [5.0, 7.0],
            plazoMax: 25,
        },
        "Terreno": {
            maxFinanciamiento: 50,
            rangoInteres: [4.5, 6.0],
            plazoMax: 15,
        },
    };

    const [canSave, setCanSave] = useState(false);
    
    useEffect(() => {
        // Cargar los detalles de la solicitud seleccionada
        solicitudService.get(id).then((response) => {
            const solicitudData = response.data;
            usuarioService.get(solicitudData.usuario.id).then((response)=>{
                setUsuario(response.data);
                console.log(response.data);
            })
            if (solicitudData.estado === "En Revisión Inicial") {
                solicitudData.estado = "En evaluación";
                solicitudService.update(solicitudData).then(() => {
                    setSolicitud({ ...solicitudData });
                });
            } else {
                setSolicitud(solicitudData);
            }
            console.log(response.data);

        });
        solicitudService.getSeguimiento(id).then((response)=>{
            setSeguimiento(response.data);
            console.log("TEST QUE SE OBTIENE", response.data);
        })
    }, [id]);

    const handleEvaluacionChange = (e) => {
        const { name, value } = e.target;
        const numericValue = value.replace(/^0+(?=\d)/, '').replace(/[^.\d]/g, '');

    // Rango de validaciones
    switch (name) {
        case "plazo":
            const maxPlazovalue = configuracionPorTipo[solicitud.tipoPrestamo].plazoMax;
            if ((numericValue > maxPlazovalue)) {
                alert(`El plazo debe estar entre 1 y ${maxPlazovalue} años.`);
                return;
            }
            setSolicitud((prevSolicitud) => ({
                ...prevSolicitud,
                [name]: parseInt(numericValue),
            }));
            return;

        case "interes": 
        const maxinteresvalue = configuracionPorTipo[solicitud.tipoPrestamo].rangoInteres;
            if (numericValue > maxinteresvalue[1]) {
                alert(`El interés debe estar entre ${maxinteresvalue[0]}% y ${maxinteresvalue[1]}%.`);
                return;
            }
            break;

        case "seguroDegravamen": // 0 a 3
            if (numericValue > 3) {
                alert("El seguro de degravamen debe estar entre 0% y 3%.");
                return;
            }
            break;

        case "seguroIncendio": // 3000 a 80000
            if (numericValue > 80000) {
                alert("El seguro de incendio debe estar entre 3000 y 80000.");
                return;
            }
            break;

        case "comision": // 0.1 a 10
            if ( numericValue > 10) {
                alert("La comisión debe estar entre 0.1% y 10%.");
                return;
            }
            break;

        case "financiamiento": // 1 a dinámico
            const maxFinanciamientovalue = configuracionPorTipo[solicitud.tipoPrestamo].maxFinanciamiento;
            if (numericValue > maxFinanciamientovalue) {
                alert(`El financiamiento debe ser hasta ${maxFinanciamientovalue}%.`);
                return;
            }
            break;

        default:
            break;
    }
        setSolicitud((prevSolicitud) => ({
            ...prevSolicitud,
            [name]: numericValue,
        }));
    };

    const handleGuardarEvaluacion = () => {
        // Verifica que todos los campos de evaluación estén completos antes de actualizar el estado
        const { plazo, interes, seguroDegravamen, seguroIncendio, comision, financiamiento} = solicitud;
        if (plazo && interes && seguroDegravamen && seguroIncendio && comision && financiamiento) {
            if (window.confirm("¿Desea guardar la evaluación y pre-aprobar la solicitud?")){
                solicitudService.getSimulation(solicitud).then((response) => {
                    const solicitudActualizada = {
                        ...solicitud,
                        estado: "Pre-Aprobada",
                        cuotaMensual: response.data
                    };
                    console.log("se encontro el valor de cuotas.", response.data);
                    solicitudService.update(solicitudActualizada).then(() => {
                        setSolicitud(solicitudActualizada);
                    });
                    solicitudService.getSeguimiento(solicitudActualizada.id).then((response)=>{
                        setSeguimiento(response.data);
                        console.log("Seguimiento",response.data);
                        window.location.reload();
                    })
                });
            }
        }
    };

    const handleConfirmarSolicitud = () => {
        
        const solicitudActualizada = { ...solicitud, estado: "En Aprobación Final" };
        solicitudService.update(solicitudActualizada).then(() => {
            setSolicitud(solicitudActualizada);
        });
        solicitudService.getSeguimiento(solicitudActualizada.id).then((response)=>{
            setSeguimiento(response.data);
            console.log("Seguimiento",response.data);
            window.location.reload();
        })
    };

    const handleConfirmarSolicitudFinal = () => {
        if (window.confirm("¿Aprobar de manera final la solicitud?")){
        const solicitudActualizada = { ...solicitud, estado: "Aprobada" };
        solicitudService.update(solicitudActualizada).then(() => {
            setSolicitud(solicitudActualizada);
        });
        solicitudService.getSeguimiento(solicitudActualizada.id).then((response)=>{
            setSeguimiento(response.data);
            console.log("Seguimiento",response.data);
            window.location.reload();
        })
    }
    };

    const handleEvaluar = () => {
        const { plazo, interes, seguroDegravamen, seguroIncendio, comision, financiamiento } = solicitud;
        setCanSave(true);
        // Llama al servicio de evaluación de la solicitud y establece los resultados en el estado `evaluacion`
        if (plazo && interes && seguroDegravamen && seguroIncendio && comision && financiamiento) {
            if (plazo < 1){
                alert("Plazo no puede ser menor a 1 año")
                setCanSave(false);
            }
            if (interes < configuracionPorTipo[solicitud.tipoPrestamo].rangoInteres[0]){
                alert(`El interes no puede ser menor a ${configuracionPorTipo[solicitud.tipoPrestamo].rangoInteres[0]}%`)
                setCanSave(false);
            }
            if (seguroIncendio < 3000){
                alert("El seguro de incendio no puede ser menor a $3000 mensual")
                setCanSave(false);
            }
            if (comision < 0.1){
                alert("La comisión no puede ser menor a 0.1%")
                setCanSave(false);
            }
            console.log("Solicitud enviada:", solicitud);
        solicitudService.evaluarSolicitud(solicitud).then((response) => {
            setEvaluacion(response.data);
            console.log(response.data);
        });
        }
    };

    const handleCostoTotal = () => {
        solicitudService.getCostoTotal(solicitud).then((response) => {
            setTotalCost(response.data);
        });
    };

    const handleRechazarEjecutivo = () => {
        const solicitudActualizada = { ...solicitud, estado: "Rechazada" };
            solicitudService.update(solicitudActualizada).then(() => {
                setSolicitud(solicitudActualizada);
                window.location.reload();
            });
    };

    const handleRechazarCliente = () => {
        if (window.confirm("¿Desea cancelar su solicitud? Esto no se puede deshacer")){
        const solicitudActualizada = { ...solicitud, estado: "Cancelada Por el Cliente" };
            solicitudService.update(solicitudActualizada).then(() => {
                setSolicitud(solicitudActualizada);
                window.location.reload();
            });
        }
    };

    const handleDesembolso = () => {
        const solicitudActualizada = { ...solicitud, estado: "En Desembolso" };
            solicitudService.update(solicitudActualizada).then(() => {
                setSolicitud(solicitudActualizada);
                window.location.reload();
            });
    };


    return (
        <div className="container mt-4">
            <h4 className="mb-4">Detalles de la Solicitud</h4>
            {solicitud ? (
                <Row>
                    {/* Columna de Detalles */}
                    <Col md={6}>
                        <p><strong>Número de la solicitud:</strong> {solicitud.id}</p>
                        <p><strong>Cliente:</strong> {usuario.nombre}</p>
                        <p><strong>Tipo de Préstamo:</strong> {solicitud.tipoPrestamo}</p>
                        <p><strong>Valor de la Propiedad:</strong> ${solicitud.valorPropiedad}</p>
                        <p><strong>Cantidad de Capital:</strong> ${usuario.salario}</p>
                        <p><strong>Deuda Total:</strong> ${usuario.deudaTotal}</p>
                        <p><strong>Estado de la solicitud:</strong> {solicitud.estado}</p>
                        <div>
                            {seguimiento.length > 0 && (
                                <div className="alert alert-warning mt-4" role="alert">
                                    <h4 className="alert-heading">{seguimiento[0]}</h4>
                                    <ul>
                                    {seguimiento.slice(1).map((resultado, index) => (
                                        <li key={index}>{resultado}</li>
                                    ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    </Col>

                    {/* Columna de Evaluación */}
                    <Col md={6}>
                        {solicitud.estado === "En evaluación" && (
                            <Form className="mt-3">
                                <h5>Evaluación del Crédito</h5>
                                <Form.Group controlId="plazo">
                                    <Form.Label>Plazo (años)</Form.Label>
                                    <Form.Control
                                        type="number"
                                        name="plazo"
                                        value={solicitud.plazo || ""}
                                        onChange={handleEvaluacionChange}
                                        placeholder={`1 hasta ${configuracionPorTipo[solicitud.tipoPrestamo].plazoMax} años`}
                                        required
                                    />
                                </Form.Group>
                                <Form.Group controlId="interes">
                                    <Form.Label>Tasa Interés Anual (%)</Form.Label>
                                    <Form.Control
                                        type="number"
                                        name="interes"
                                        value={solicitud.interes || ""}
                                        onChange={handleEvaluacionChange}
                                        placeholder={`${configuracionPorTipo[solicitud.tipoPrestamo].rangoInteres[0]}% - ${configuracionPorTipo[solicitud.tipoPrestamo].rangoInteres[1]}%`}
                                    />
                                </Form.Group>
                                <Form.Group controlId="seguroDegravamen">
                                    <Form.Label>Seguro Degravamen (%)</Form.Label>
                                    <Form.Control
                                        type="number"
                                        name="seguroDegravamen"
                                        value={solicitud.seguroDegravamen || ""}
                                        onChange={handleEvaluacionChange}
                                        placeholder={`0% - 3%`}
                                    />
                                </Form.Group>
                                <Form.Group controlId="seguroIncendio">
                                    <Form.Label>Seguro Incendio (Pago Mensual)</Form.Label>
                                    <Form.Control
                                        type="number"
                                        name="seguroIncendio"
                                        value={solicitud.seguroIncendio || ""}
                                        onChange={handleEvaluacionChange}
                                        placeholder={`$3000 - $80000 Mensual`}
                                    />
                                </Form.Group>
                                <Form.Group controlId="comision">
                                    <Form.Label>Comisión por Administración (%)</Form.Label>
                                    <Form.Control
                                        type="number"
                                        name="comision"
                                        value={solicitud.comision || ""}
                                        onChange={handleEvaluacionChange}
                                        placeholder={`0.1% - 10%`}
                                    />
                                </Form.Group>
                                <Form.Group controlId="porcentajeFinanciamiento">
                                    <Form.Label>Financiamiento (%)</Form.Label>
                                    <Form.Control
                                        type="number"
                                        name="financiamiento"
                                        value={solicitud.financiamiento || ""}
                                        onChange={handleEvaluacionChange}
                                        placeholder={`Máximo ${configuracionPorTipo[solicitud.tipoPrestamo].maxFinanciamiento}%`}
                                    />
                                </Form.Group>
                                <Button variant="primary" onClick={handleEvaluar} className="mr-2">
                                    Evaluar Préstamo con datos dados
                                </Button>
                                <Button variant="success" onClick={handleGuardarEvaluacion} className="mt-3" disabled={!canSave}>
                                    Guardar Evaluación
                                </Button>
                                <Button variant="danger" onClick={handleRechazarEjecutivo} className="mt-3">
                                    Rechazar Solicitud
                                </Button>
                            </Form>
                        )}

                        {solicitud.estado === "Pre-Aprobada" && (
                            <div className="mt-3">
                                <Button variant="primary" onClick={handleCostoTotal} className="mr-2">
                                    Calcular Costos Totales
                                </Button>
                                <Button variant="success" onClick={handleConfirmarSolicitud}>
                                    Aceptar Términos del contrato
                                </Button>
                                <Button variant="danger" onClick={handleRechazarCliente} className="mt-3">
                                    Cancelar Solicitud
                                </Button>
                            </div>
                        )}

                        {solicitud.estado === "En Aprobación Final" && (
                            <div className="mt-3">
                                <Button variant="primary" onClick={handleCostoTotal} className="mr-2">
                                    Calcular Costos Totales
                                </Button>
                                <Button variant="primary" onClick={handleConfirmarSolicitudFinal} className="mr-2">
                                    Aprobar Solicitud
                                </Button>
                            </div>
                        )}

                        {solicitud.estado === "Aprobada" && (
                            <div className="mt-3">
                                <Button variant="primary" onClick={handleDesembolso} className="mr-2">
                                    Mover a Desembolso
                                </Button>
                            </div>
                        )}

                        {evaluacion && (
                            <div className="mt-4">
                                <h5>Resultados de la Evaluación</h5>
                                <ul>
                                    {evaluacion.map((resultado, index) => (
                                        <li key={index}>{resultado}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                        {totalCost && (
                            <div className="mt-4">
                                <h5>Información del Préstamo:</h5>
                                <ul>
                                    {totalCost.map((linea, index) => (
                                        index === 0 ?(

                                        <h6 key={index} style={{ fontWeight: 'bold' }}>{linea}</h6>
                                        ) : (
                                        <li key={index}>{linea}</li>
                                        )
                                    ))}
                                </ul>
                            </div>
                        )}
                    </Col>
                </Row>
            ) : (
                <p>Cargando detalles de la solicitud...</p>
            )}
        </div>
    );
};

export default SolicitudDetalle;