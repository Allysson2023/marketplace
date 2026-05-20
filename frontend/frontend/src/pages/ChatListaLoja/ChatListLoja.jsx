import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import socket from "../../socket";
import "./ChatListLoja.css";

function ChatListLoja() {

    const [chats, setChats] = useState([]);
    const navigate = useNavigate();

    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user"));
    const lojaId = user?.loja_id;

    // ===============================
    // CARREGAR CHATS
    // ===============================
    const carregarChats = () => {

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
            }
        })
        .catch(err => console.log(err));
    };

    // ===============================
    // INIT
    // ===============================
    useEffect(() => {

        carregarChats();

        // entra na sala da loja (IMPORTANTE)
        if (lojaId) {
            socket.emit("join_loja", lojaId);
        }

    }, [lojaId]);

    // ===============================
    // SOCKET TEMPO REAL
    // ===============================
    useEffect(() => {

        const handleNovaMensagem = (msg) => {
            console.log("Nova mensagem recebida:", msg);

            // atualiza lista inteira (simples e seguro)
            carregarChats();
        };

        socket.on("nova_mensagem_loja", handleNovaMensagem);

        return () => {
            socket.off("nova_mensagem_loja", handleNovaMensagem);
        };

    }, [lojaId]);

    return (
        <div className="chat-list-container">

            <h2 className="titulo">💬 Conversas</h2>

            <button
                className="btn-voltar"
                onClick={() => window.history.back()}
            >
                ← Voltar
            </button>

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
                            onClick={() => navigate(`/chat/${chat.id}/loja`)}
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