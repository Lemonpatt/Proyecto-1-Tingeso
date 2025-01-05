import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import usuarioService from "../services/usuario.service";

const Preview = () => {
    const { userId } = useParams();
    const [user, setUser] = useState(null);

    useEffect(() => {
        const fetchUser = async () => {
            const userData = await usuarioService.get(userId);
            setUser(userData.data);
            console.log("Usuario de documento", user);
        };

        fetchUser();
    }, [userId]);

    return (
        <div>
            <h2>Vista Previa del Documento de {user ? user.nombre : "Cargando..."}</h2>
            {user && user.documento ? (
                <embed
                    src={`${user.documento}`}
                    type="application/pdf"
                    width="100%"
                    height="600px"
                />
            ) : (
                <p>No se encontró el documento</p>
            )}
        </div>
    );
};
export default Preview;