import axios from "axios";

const prestabancoServer = import.meta.env.VITE_PRESTABANCO_SERVER;
const prestabancoPort = import.meta.env.VITE_PRESTABANCO_PORT;
console.log(prestabancoServer);
console.log(prestabancoPort);
export default axios.create({
    baseURL: `http://${prestabancoServer}:${prestabancoPort}`,
    headers: {
    'Content-Type': 'application/json'
}
});
