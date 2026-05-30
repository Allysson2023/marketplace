import { useEffect, useState, useRef } from "react";
import { useNavigate , useParams} from "react-router-dom";
import socket from "../../socket";
import "./ChatListLoja.css";

import somNotificacao from "../../assets/sounds/notification.mp3";

function ChatListLoja() {
 
    const [chats, setChats] = useState([]);
    const navigate = useNavigate();

    const params = useParams();
const lojaId = Number(params.id);

    const token = localStorage.getItem("token");

    let user = null;
try {
    user = JSON.parse(localStorage.getItem("user"));
} catch (err) {
    user = null;
}




   

    // ===============================
    // CARREGAR CHATS
    // ===============================
    const carregarChats = async () => {
    if (!lojaId || !token) return;

    try {
        const res = await fetch(
            `http://localhost:3000/api/chat/loja/${lojaId}`,
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        if (!res.ok) throw new Error("Erro ao carregar chats");

        const data = await res.json();

        const chatsOrdenados = data.sort(
            (a, b) =>
                new Date(b.atualizado_em || 0) -
                new Date(a.atualizado_em || 0)
        );

        setChats(chatsOrdenados);

    } catch (err) {
        console.log(err);
    }
};

    // ===============================
    // INIT
    // ===============================
    useEffect(() => {
  if (!token) return;

  if (!lojaId) return;

  carregarChats();
  socket.emit("join_loja", lojaId);
}, [lojaId, token]);

    // ===============================
    // SOCKET TEMPO REAL
    // ===============================
    const currentUser = JSON.parse(localStorage.getItem("user"));

useEffect(() => {

    const handleNovaMsg = (msg) => {

        const isMyMessage =
            msg.remetente_tipo === "loja" &&
            Number(msg.remetente_id) === Number(currentUser?.id);

        const isChatOpen =
            window.location.pathname.includes(`/chat/${msg.chat_id}/loja`);

        if (isMyMessage || isChatOpen) return;

        try {
            const audio = new Audio(somNotificacao);
            audio.play();
        } catch {}

        setChats(prev => {
            let updated = [...prev];

            const index = updated.findIndex(
                c => Number(c.id) === Number(msg.chat_id)
            );

            if (index !== -1) {
                updated[index] = {
                    ...updated[index],
                    ultima_mensagem: msg.mensagem,
                    tem_nova_msg: true,
                    atualizado_em: msg.criado_em
                };
            } else {
                updated.unshift({
                    id: msg.chat_id,
                    pedido_id: msg.pedido_id,
                    ultima_mensagem: msg.mensagem,
                    tem_nova_msg: true,
                    atualizado_em: msg.criado_em
                });
            }

            updated.sort((a, b) =>
                new Date(b.atualizado_em || 0) - new Date(a.atualizado_em || 0)
            );

            return updated;
        });
    };

    socket.on("nova_mensagem_loja", handleNovaMsg);

    return () => {
        socket.off("nova_mensagem_loja", handleNovaMsg);
    };

}, [lojaId]);

    // ===============================
    // ABRIR CHAT
    // ===============================
    async function abrirChat(chatId) {

    try {

        await fetch(
            `http://localhost:3000/api/chat/visualizar/${chatId}`,
            {
                method: "PUT",
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        setChats(prev =>
            prev.map(chat =>
                Number(chat.id) === Number(chatId)
                    ? {
                        ...chat,
                        tem_nova_msg: false
                    }
                    : chat
            )
        );

        navigate(`/chat/${Number(chatId)}/loja`);

    } catch (err) {
        console.log(err);
    }
}

    // ===============================
    // VOLTAR
    // ===============================
    function voltar() {
        navigate(-1);
    }

    useEffect(() => {
    console.log("USER:", user);
    console.log("LOJA_ID:", lojaId);
}, []);

    return (

        <div className="chat-list-container">

            <div className="top-bar">

                <button
                    className="btn-voltar"
                    onClick={voltar}
                >
                    ← Voltar
                </button>

                <h2>💬 Conversas</h2>

            </div>

            {chats.length === 0 ? (

                <p className="sem-chats">
                    Nenhuma conversa encontrada
                </p>

            ) : (

                <div className="lista-chats">

                    {chats.map(chat => (

                        <div
                            key={chat.id}
                            className={`chat-card ${
                                chat.tem_nova_msg ? "ativo" : ""
                            }`}
                            onClick={() => abrirChat(chat.id)}
                        >

                            {chat.tem_nova_msg && (
                                <span className="bolinha-notificacao"></span>
                            )}

                            <div className="chat-info">

                                <h3>
                                    Pedido #{chat.pedido_id}
                                </h3>

                                <p className="ultima-msg">
                                    {chat.ultima_mensagem ||
                                        "Sem mensagens ainda"}
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