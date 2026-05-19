import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./ChatListLoja.css";

function ChatListLoja() {

    const [chats, setChats] = useState([]);
    const navigate = useNavigate();

    const token = localStorage.getItem("token");

    // ✔ CORRETO: pega do user
    const user = JSON.parse(localStorage.getItem("user"));
    const lojaId = user?.loja_id;

    useEffect(() => {

        // 🚨 trava de segurança
        if (!lojaId || !token) return;

        fetch(`http://localhost:3000/api/chat/loja/${lojaId}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
        .then(res => res.json())
        .then(data => {
            if (Array.isArray(data)) {
                setChats(data);
            } else {
                setChats([]);
            }
        })
        .catch(err => console.log("Erro ao carregar chats:", err));

    }, [lojaId, token]);

    return (

        <div className="chat-list-container">

            <h2 className="titulo">💬 Conversas</h2>

            {/* debug útil */}
            {/* <p>Loja ID: {String(lojaId)}</p> */}

            {chats.length === 0 ? (
                <p className="sem-chats">
                    Nenhuma conversa encontrada
                </p>
            ) : (
                <div className="lista-chats">

                    {chats.map(chat => (

                        <div
                            key={chat.id}
                            className="chat-card"
                            onClick={() => navigate(`/chat/${chat.id}`)}
                        >

                            <div className="chat-info">

                                <h3>
                                    Pedido #{chat.pedido_id}
                                </h3>

                                <p className="ultima-msg">
                                    {chat.ultima_mensagem || "Sem mensagens ainda"}
                                </p>

                            </div>

                            <div className="chat-seta">
                                →
                            </div>

                        </div>

                    ))}

                </div>
            )}

        </div>
    );
}

export default ChatListLoja;