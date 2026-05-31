import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./PerfilCliente.css";

function PerfilCliente() {

    const navigate = useNavigate();

    const [usuario, setUsuario] = useState({
        username: "",
        email: "",
        created_at: ""
    });

    useEffect(() => {
        carregarPerfil();
    }, []);

    const carregarPerfil = async () => {
        try {
            const resposta = await fetch(
                "http://localhost:3000/api/client-profile",
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`
                    }
                }
            );

            const dados = await resposta.json();

            setUsuario(dados);

        } catch (erro) {
            console.log(erro);
        }
    };

    return (
        <div className="perfil-cliente">

            <div className="topo-perfil">
                <button onClick={() => navigate(-1)}>
                    ← Voltar
                </button>
            </div>

            <div className="card-perfil">

                <div className="avatar">
                    {usuario.username?.charAt(0).toUpperCase()}
                </div>

                <h2>{usuario.username}</h2>

                <p>{usuario.email}</p>

                <span>
                    Cliente desde{" "}
                    {usuario.created_at
                        ? new Date(usuario.created_at).toLocaleDateString("pt-BR")
                        : "-"}
                </span>

                <div className="estatisticas">

                    <div className="box-stat">
                        <h3>0</h3>
                        <p>Pedidos</p>
                    </div>

                    <div className="box-stat">
                        <h3>0</h3>
                        <p>Favoritos</p>
                    </div>

                </div>

                <button
                    className="btn-editar"
                    onClick={() => navigate(`/atualizar-cliente/${usuario.id}`)}
                >
                    Editar Perfil
                </button>

                <button
                    className="btn-sair"
                    onClick={() => {
                        localStorage.removeItem("token");
                        navigate("/login");
                    }}
                >
                    Sair da Conta
                </button>

            </div>

        </div>
    );
}

export default PerfilCliente;