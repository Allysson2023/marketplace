import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./MeusPedidos.css";
import socket from "../../socket";

function MeusPedidos() {

    const [pedidos, setPedidos] = useState([]);
    const navigate = useNavigate();

    const token = localStorage.getItem("token");

    const user = JSON.parse(localStorage.getItem("user"));

    const nomesStatus = {
        aceito: "✅ Pedido Aceito",
        separacao: "📦 Em Separação",
        rota: "🛵 Em Rota",
        finalizado: "✔️ Finalizado",
        recusado: "❌ Recusado"
    };

    useEffect(() => {

        fetchPedidos();

        // 🔥 ENTRAR NA ROOM
        socket.emit("join", user.id);

        // 🔥 OUVIR NOTIFICAÇÃO
        socket.on("nova_notificacao", (data) => {

            console.log("Notificação recebida:", data);

            // 🔥 Atualizar pedidos automaticamente
            fetchPedidos();

        });

        return () => {
    socket.off("nova_notificacao");
};

    }, []);

    const fetchPedidos = () => {

        fetch("http://localhost:3000/api/meus-pedidos", {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
        .then(res => res.json())
        .then(data => {
            setPedidos(data);
        })
        .catch(err => console.log(err));

    };

    return (
        <div className="pagina-pedidos">

            <div className="topo-pedidos">

                <button
                    className="btn-voltar"
                    onClick={() => navigate(-1)}
                >
                    ← Voltar
                </button>

                <h1>📦 Meus Pedidos</h1>

            </div>

            {pedidos.length === 0 ? (
                <p>Você ainda não fez pedidos</p>
            ) : (

                <div className="lista-pedidos">

                    {pedidos.map(pedido => (

                        <div
                            key={pedido.id}
                            className="card-pedido"
                            onClick={() => navigate(`/pedido/${pedido.id}`)}
                        >

                            <h3>Pedido #{pedido.id}</h3>

                            <p className={`status ${pedido.status}`}>
                                {nomesStatus[pedido.status] || pedido.status}
                            </p>

                            <span>R$ {pedido.total}</span>

                        </div>

                    ))}

                </div>

            )}

        </div>
    );
}

export default MeusPedidos;