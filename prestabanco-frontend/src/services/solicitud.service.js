import httpClient from "../http-common"

const getAll = () => {
    return httpClient.get('/solicitud/');
}

const create = data => {
    return httpClient.post("/solicitud/crear",data);
}

const get = id => {
    return httpClient.get(`/solicitud/${id}`);
}


const update = data => {
    return httpClient.put('/solicitud/update',data);
}

const getSimulation = data => {
    return httpClient.post("/solicitud/simulacion", data);
}

const evaluarSolicitud = data => {
    return httpClient.post(`/solicitud/evaluar`, data);
}

const getCostoTotal = data => {
    return httpClient.post("/solicitud/evaluar/costo-total", data);
}

const remove = id => {
    return httpClient.delete(`/solicitud/${id}`);
}

const getSeguimiento = id =>{
    return httpClient.get(`/solicitud/seguimiento/${id}`);
}
export default {getAll, create, get, update, getSimulation, evaluarSolicitud, getCostoTotal, remove, getSeguimiento};