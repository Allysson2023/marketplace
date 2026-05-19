import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import socket from "../../socket";
import "./ChatLoja.css";

function ChatLoja() {

    const [conversas, setConversas] = useState([]);
    const navigate = useNavigate();

    const token = localStorage.getItem("token");
    const loja = JSON.parse(localStorage.getItem("loja") || "{}");



    // ENTRAR NA SALA DA LOJA
    useEffect(() => {

        if (!loja?.id) return;

    socket.emit("join_loja", loja.id);

    }, []);




    // BUSCAR CONVERSAS (vamos simular com pedidos por enquanto)
    useEffect(() => {

        fetch("http://localhost:3000/api/pedidos", {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
        .then(res => res.json())
        .then(data => {
            setConversas(data);
        });

    }, []);




    return (

        <div className="chat-loja-container">

        <div className="chat-loja-header">
            💬 Chat da Loja
        </div>

        <div className="chat-loja-lista">

            {conversas.map((c) => (

                <div
                    key={c.id}
                    className="chat-loja-card"
                    onClick={() => navigate(`/chat/${c.id}`)}
                >

                    <h3>Pedido #{c.id}</h3>

                    <p>Status: {c.status}</p>

                    <span className="abrir-chat">
                        Abrir conversa →
                    </span>

                </div>

            ))}

        </div>

    </div>

    );
}

export default ChatLoja;