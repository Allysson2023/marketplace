import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./PainelPedidos.css";
import socket from "../../socket";
import somPedido from "../../assets/sounds/notification.mp3";


function PainelPedidos() {

    const navigate = useNavigate();
    const { id: storeId } = useParams();
    const token = localStorage.getItem("token");

    const [pedidos, setPedidos] = useState([]);
    const audioRef = useRef(null);

    useEffect(() => {

        audioRef.current = new Audio(somPedido);

audioRef.current.volume = 1;


        // 📥 busca inicial
        const fetchPedidos = () => {
            fetch(`http://localhost:3000/api/loja/${storeId}/pedidos`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) {
                    setPedidos(data);
                }
            });
        };

        fetchPedidos();

        // 🏠 entra na sala da loja
        socket.emit("join_loja", storeId);

        // 🔥 escuta pedidos novos
        socket.on("novo_pedido", (data) => {

    console.log("🔥 NOVO PEDIDO CHEGOU:", data);
    audioRef.current.currentTime = 0;

    audioRef.current.play().catch(err => {
    console.log("ERRO AUDIO:", err);
});

    fetchPedidos();

});

        return () => {
    socket.off("novo_pedido");
};

    }, [storeId, token]);

    const atualizarStatus = async (id, status) => {
        try {
            const res = await fetch(`http://localhost:3000/api/pedidos/${id}/status`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ status })
            });

            const data = await res.json();

            if (!res.ok) {
                alert(data.message);
                return;
            }

            setPedidos(prev =>
                prev.map(p =>
                    p.id === id ? { ...p, status } : p
                )
            );

        } catch (err) {
            console.log(err);
        }
    };

    function abrirPedido(id) {
        navigate(`/admin/pedido/${id}`);
    }

    return (

        <div className="painel-container">

            <div className="topo-painel">

    <button
        className="btn-voltar"
        onClick={() => navigate(-1)}
    >
        ← Voltar
    </button>

    <h1>Painel de Pedidos</h1>
    <p>Gerencie os pedidos da sua loja</p>
    <button
    onClick={() => navigate("/chats")}
    style={{
        padding: "10px 15px",
        background: "#ff4d4d",
        color: "#fff",
        border: "none",
        borderRadius: 8,
        cursor: "pointer"
    }}
>
    💬 Conversas
</button>

</div>

            <div className="cards-info">

                <div className="info-card">
                    <h2>{pedidos.length}</h2>
                    <span>Pedidos</span>
                </div>

                <div className="info-card">
                    <h2>
    R$ {
        pedidos
            .filter(pedido => pedido.status === "finalizado")
            .reduce((acc, item) => acc + Number(item.total || 0), 0)
            .toFixed(2)
    }
</h2>
                    <span>Faturamento</span>
                </div>

            </div>

            <div className="lista-pedidos">

                {pedidos.length === 0 ? (

                    <div className="sem-pedidos">
                        <h2>Nenhum pedido encontrado</h2>
                    </div>

                ) : (

                    pedidos.map((pedido) => (

                        <div
    className="card-pedido"
    key={pedido.id}
    onClick={() => abrirPedido(pedido.id)}
>

                            <div className="pedido-topo">

                                <div>
                                    <h2>Pedido #{pedido.id}</h2>
                                    <p>Cliente: {pedido.username}</p>
                                </div>

                                <span className={`status ${pedido.status}`}>
                                    {pedido.status}
                                </span>

                            </div>

                            <div className="pedido-info">

                                <p>
                                    Tipo: <strong>{pedido.tipo_pedido}</strong>
                                </p>

                                <p>
                                    Total: <strong>R$ {pedido.total}</strong>
                                </p>

                            </div>

                            <div className="pedido-acoes">

                                <button
    className="btn-aceitar"
    onClick={(e) => {
        e.stopPropagation();
        atualizarStatus(pedido.id, "aceito");
    }}
>
    Aceitar
</button>

                                <button
    className="btn-recusar"
    onClick={(e) => {
        e.stopPropagation();
        atualizarStatus(pedido.id, "recusado");
    }}
>
    Recusar
</button>

                            </div>

                        </div>

                    ))

                )}

            </div>

           

        </div>
    );
}

export default PainelPedidos;