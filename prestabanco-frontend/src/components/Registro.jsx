import { Link } from "react-router-dom";
import usuarioService from "../services/usuario.service";
import React, { useState, useEffect } from "react";


function UserTable() {
  const [users, setUsers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    id: "",
    nombre: "",
    rut: "",
    edad: "",
    salario: "",
    saldoCuenta: "",
    antiguedadCuenta: "",
    deudaTotal: "",
  });
  const [documento, setDocumento] = useState(null);
  const [fileBytes, setFileBytes] = useState(null);

  // Busca a los usuarios desde el backend
  useEffect(() => {
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
    fetchUsers();
  }, []);

  const formatRut = (value) => {
    // Elimina todos los caracteres no numéricos excepto la "k" o "K" final
    const cleaned = value.replace(/[^0-9kK]/g, "");
    const limited = cleaned.slice(0, 9);
    
    // Aplica el formato de RUT usando expresiones regulares
    return limited
        .replace(/^(\d{2})(\d{3})(\d{3})([0-9kK]{1})$/, "$1.$2.$3-$4")
};

const formatNumber = (value) => {
    let formattedValue = value.replace(/[^0-9]/g, "");
    
    if (formattedValue.startsWith("0")) {
        formattedValue = formattedValue.substring(1);
    }
    return formattedValue
};

// Función para manejar la eliminación del usuario
const handleDelete = async (id) => {
    try {
        await usuarioService.remove(id);
        console.log("Usuario eliminado con éxito");
        usuarioService.getAll().then((response) =>{
            setUsers(response.data);
          });
    } catch (error) {
        console.error("Error al eliminar el usuario, tiene solicitudes en el sistema.");
        alert("Usuario tiene solicitudes en el sistema.");
    }
};

const handleChange = (e) => {
    const { name, value } = e.target;

    let formattedValue;
    switch (name) {
        case "rut":
            formattedValue = formatRut(value);
            break;
        case "edad":
            formattedValue = formatNumber(value).slice(0, 2);
            break;
        case "salario":
            formattedValue = formatNumber(value);
            break;
        case "deudaTotal":
            formattedValue = formatNumber(value);
            break;
        default:
            formattedValue = value;
    }

    setFormData({
        ...formData,
        [name]: formattedValue,
    });
};


  const handleFileChange = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();

    if (!file) return;

    reader.onload = (e) => {
        console.log("Bytes del archivo:", e.target.result);
        setFileBytes(e.target.result);
    };
    reader.readAsDataURL(file);
    setDocumento(file.name);
  };

  const handleEdit = (userId) => {
    const userToEdit = users.find((user) => user.id === userId);
    console.log("El usuario a editar es:", userToEdit);
    setFormData({
      id: userToEdit.id,
      nombre: userToEdit.nombre,
      rut: userToEdit.rut,
      edad: userToEdit.edad,
      salario: userToEdit.salario,
      deudaTotal: userToEdit.deudaTotal,
      saldoCuenta: userToEdit.saldoCuenta,
      antiguedadCuenta: userToEdit.antiguedadCuenta,
    });
    setDocumento(userToEdit.nombreArchivo);
    setFileBytes(userToEdit.documento);
    setIsEditing(true);
    setShowForm(true); // Abre el formulario automáticamente
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log(formData);
    const data = new FormData();
    data.append("nombre", formData.nombre);
    data.append("rut", formData.rut);
    data.append("edad", formData.edad);
    data.append("salario", formData.salario);
    data.append("deudaTotal", formData.deudaTotal);
    data.append("saldoCuenta", formData.saldoCuenta);
    data.append("antiguedadCuenta", formData.antiguedadCuenta);
    if (documento) data.append("nombreArchivo", documento);
    if (fileBytes) data.append("documento", fileBytes);
    for (let pair of data.entries()) {
      console.log(pair[0] + ": " + pair[1]);
    }
    if (isEditing) {
      data.append("id", formData.id);
      // Actualiza el usuario existente
      usuarioService.update(data);
      setIsEditing(false);

        setShowForm(false);
        setFormData({
          nombre: "",
          rut: "",
          edad: "",
          salario: "",
          saldoCuenta: "",
          antiguedadCuenta: "",
          deudaTotal: "",
        });
        setDocumento(null);
        setFileBytes(null);
        // Muestra la nueva lista de usuarios
        usuarioService.getAll().then((response) =>{
          setUsers(response.data);
        });
      
    } else {
      usuarioService.register(data).then((response)=> {
        setShowForm(false);
        setFormData({
          nombre: "",
          rut: "",
          edad: "",
          salario: "",
          saldoCuenta: "",
          antiguedadCuenta: "",
          deudaTotal: "",
        });
        setDocumento(null);
        setFileBytes(null);
        // Muestra la nueva lista de usuarios
        usuarioService.getAll().then((response) =>{
          setUsers(response.data);
        });
      }).catch((error) => {
        console.log(
        "Ha ocurrido un error al intentar generar la simulacion.",
        error
        );
        });
      }
      setIsEditing(false);
  };

  return (
    <div className="container mt-5">
      <h2>Lista de Usuarios</h2>
      <button
        className="btn btn-primary mb-3"
        onClick={() => {setShowForm((prev) => !prev); setIsEditing(false); setFormData({
          nombre: "",
          rut: "",
          edad: "",
          salario: "",
          saldoCuenta: "",
          antiguedadCuenta: "",
          deudaTotal: "",
        });
        setFileBytes(null);
        setDocumento(null)}}
      >
        {showForm ? "Cerrar Formulario" : "Registrar Nuevo Usuario"}
      </button>

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-4">
          <div className="form-group">
            <label>Nombre</label>
            <input
              type="text"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              className="form-control"
              required
            />
          </div>
          <div className="form-group">
            <label>RUT</label>
            <input
              type="text"
              name="rut"
              value={formData.rut}
              onChange={handleChange}
              className="form-control"
              required
            />
          </div>
          <div className="form-group">
            <label>Edad</label>
            <input
              type="text"
              name="edad"
              value={formData.edad}
              onChange={handleChange}
              className="form-control"
              required
            />
          </div>
          <div className="form-group">
            <label>Salario Mensual</label>
            <input
              type="text"
              name="salario"
              value={formData.salario}
              onChange={handleChange}
              className="form-control"
              required
            />
          </div>
          <div className="form-group">
            <label>Saldo Cuenta Bancaria</label>
            <input
              type="text"
              name="saldoCuenta"
              value={formData.saldoCuenta}
              onChange={handleChange}
              className="form-control"
              required
            />
          </div>
          <div className="form-group">
            <label>Antiguedad de la Cuenta (Años)</label>
            <input
              type="text"
              name="antiguedadCuenta"
              value={formData.antiguedadCuenta}
              onChange={handleChange}
              className="form-control"
              required
            />
          </div>
          <div className="form-group">
            <label>Deuda Total</label>
            <input
              type="number"
              name="deudaTotal"
              value={formData.deudaTotal}
              onChange={handleChange}
              className="form-control"
              required
            />
          </div>
          <div className="form-group">
            <label>Documento</label>
            <input
              type="file"
              onChange={handleFileChange}
              className="form-control"
              accept="application/pdf"
            />
            {fileBytes && (
                <div style={{ marginTop: "20px" }}>
                    <h3>Vista Previa del PDF</h3>
                    <embed src={fileBytes} type="application/pdf" width="100%" height="600px" />
                    {isEditing && (
                      <button
                        onClick={() => {
                            setFileBytes(null);
                            setDocumento(null);
                          }}
                        className="btn btn-danger mt-3"
                      >
                        Eliminar Archivo
                      </button>
                )}
                </div>
            )}
          </div>
          <button type="submit" className="btn btn-success mt-3">
          {isEditing ? "Actualizar Usuario" : "Registrar Usuario"}
          </button>
        </form>
      )}

      <table className="table table-striped">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>RUT</th>
            <th>Edad</th>
            <th>Salario</th>
            <th>Saldo en Cuenta de Banco</th>
            <th>Deuda Total</th>
            <th>Documento</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td>{user.nombre}</td>
              <td>{user.rut}</td>
              <td>{user.edad}</td>
              <td>{`$${user.salario}`}</td>
              <td>{`$${user.saldoCuenta}`}</td>
              <td>{`$${user.deudaTotal}`}</td>
              <td>
                {user.documento ? (
                  <Link to={`/preview/${user.id}`}>Ver Documento</Link>
                  
                ) : (
                  "No disponible"
                )}
              </td>
            <td>
              <button
                className="btn btn-success"
                onClick={() => handleEdit(user.id)}
            >
                Editar Usuario
            </button>
            <button
                className="btn btn-danger"
                onClick={() => handleDelete(user.id)}
            >
                Eliminar Usuario
            </button>
            </td>
            </tr>
            
          ))}
        </tbody>
      </table>
      
    </div>
  );
}

export default UserTable;
