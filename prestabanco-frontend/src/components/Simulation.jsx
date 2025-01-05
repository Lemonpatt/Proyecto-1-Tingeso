import solicitudService from "../services/solicitud.service";
import { useState } from "react";




const Simulation = () => {
    const [formData, setFormData] = useState({
      valorPropiedad: "",
      plazo: "",
      interes: "",
      financiamiento: 0,
    });
    const [simulationResult, setSimulationResult] = useState(null);
  
    const handleChange = (e) => {
      const { name, value } = e.target;
      setFormData((prevData) => ({
        ...prevData,
        [name]: value,
      }));
    };
  
    const handleSubmit = async (e) => {
      e.preventDefault();
    solicitudService.getSimulation(formData).then((response) => {
            setSimulationResult(response.data);
            console.log("se encontro el valor de cuotas.", response.data);
        })
        .catch((error) => {
        console.log(
        "Ha ocurrido un error al intentar generar la simulacion.",
        error
        );
        });
    };

  
    return (
      <div className="container mt-5">
        <h2>Simulación de Crédito Hipotecario</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Monto del Préstamo</label>
            <input
              type="number"
              name="valorPropiedad"
              value={formData.valorPropiedad}
              onChange={handleChange}
              className="form-control"
              min="1"
              step="1"
              required
            />
          </div>
          <div className="form-group">
            <label>Plazo (en años)</label>
            <input
              type="number"
              name="plazo"
              value={formData.plazo}
              onChange={handleChange}
              className="form-control"
              step="1"
              min="1"
              max="100"
              required
            />
          </div>
          <div className="form-group">
            <label>Tasa de Interés Anual (%)</label>
            <input
              type="number"
              name="interes"
              value={formData.interes}
              onChange={handleChange}
              step="0.1"
              pattern="^\d*(\.\d{1,2})?$"
              className="form-control"
              min="0"
              max="20"
              required
            />
          </div>
          <button type="submit" className="btn btn-primary mt-3">
            Calcular Cuota Mensual
          </button>
        </form>
  
        {simulationResult && (
          <div className="mt-4">
            <h3>Resultado de la Simulación</h3>
            <p>Valor de cuotas mensuales: ${simulationResult}</p>

          </div>
        )}
      </div>
    );
  }

  export default Simulation;