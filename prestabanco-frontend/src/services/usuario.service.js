import httpClient from "../http-common"

const getAll = () => {
    return httpClient.get('/usuarios/');
}

const register = data => {
    return httpClient.post("/usuarios/crear",data);
}

const get = id => {
    return httpClient.get(`/usuarios/${id}`);
}

const getName = nombreArchivo => {
    return httpClient.get(`/usuarios/${nombreArchivo}`);
}

const update = data => {
    return httpClient.put('/usuarios/update',data);
}

const remove = id => {
    return httpClient.delete(`/usuarios/${id}`);
}
export default {getAll, register, get, getName, update, remove};