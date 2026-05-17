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

                    {notificacoes.map((notificacao) => (

                        <div
                            key={notificacao.id}
                            className="card-notificacao"
                        >

                            <h3>{notificacao.titulo}</h3>

                            <p>{notificacao.mensagem}</p>

                        </div>

                    ))}

                </div>

            )}

        </div>

    );

}

export default Notificacoes;