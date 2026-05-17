import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Notificacoes.css";

function Notificacoes() {

    const [notificacoes, setNotificacoes] = useState([]);

    const navigate = useNavigate();

    const token = localStorage.getItem("token");

    useEffect(() => {

        fetch("http://localhost:3000/api/notifications", {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
        .then(res => res.json())
        .then(data => {
            setNotificacoes(data);
        })
        .catch(err => console.log(err));

    }, []);

    return (

        <div className="pagina-notificacoes">

            <div className="topo-notificacoes">

                <button
                    className="btn-voltar"
                    onClick={() => navigate(-1)}
                >
                    ← Voltar
                </button>

                <h1>🔔 Notificações</h1>

            </div>

            {notificacoes.length === 0 ? (

                <p>Nenhuma notificação</p>

            ) : (

                <div className="lista-notificacoes">

                    {notificacoes.map((n) => (
    <div
        key={n.id}
        className="card-notificacao"
        onClick={() => navigate(`/pedido/${n.pedido_id}`)}
        style={{ cursor: "pointer" }}
    >

        <h3>{n.titulo}</h3>

        <p>{n.mensagem}</p>

        <small>
            📅 {new Date(n.created_at).toLocaleString()}
        </small>

        <small style={{ display: "block", color: "#999" }}>
            Pedido #{n.pedido_id}
        </small>

    </div>
))}

                </div>

            )}

        </div>

    );

}

export default Notificacoes;