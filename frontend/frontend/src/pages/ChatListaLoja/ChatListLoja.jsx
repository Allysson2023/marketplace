import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import socket from "../../socket";
import "./ChatListLoja.css";

import somNotificacao from "../../assets/sounds/notification.mp3";

function ChatListLoja() {

    const [chats, setChats] = useState([]);
    const navigate = useNavigate();

    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user"));

    const lojaId = user?.loja_id;

    const audioRef = useRef(new Audio(somNotificacao));

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

            const data = await res.json();

            if (Array.isArray(data)) {

                // ordena logo ao carregar
                const chatsOrdenados = data.sort((a, b) =>
                    new Date(b.atualizado_em || 0) -
                    new Date(a.atualizado_em || 0)
                );

                setChats(chatsOrdenados);
            }

        } catch (err) {
            console.log(err);
        }
    };

    // ===============================
    // INIT
    // ===============================
    useEffect(() => {

        carregarChats();

        if (lojaId) {
            socket.emit("join_loja", lojaId);
        }

    }, [lojaId]);

    // ===============================
    // SOCKET TEMPO REAL
    // ===============================
    useEffect(() => {

    const handleNovaMsg = (msg) => {

    const user = JSON.parse(localStorage.getItem("user"));

    // 🚨 bloqueia mensagem da própria loja
    if (
        msg.remetente_tipo === "loja" &&
        Number(msg.remetente_id) === Number(user?.id)
    ) {
        return;
    }

    audioRef.current.currentTime = 0;
    audioRef.current.play().catch(() => {});

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
            new Date(b.atualizado_em || 0) -
            new Date(a.atualizado_em || 0)
        );

        return [...updated];
    });
};

    socket.on("nova_mensagem_loja", handleNovaMsg);

    return () => {
        socket.off("nova_mensagem_loja", handleNovaMsg);
    };

}, []);

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

        navigate(`/chat/${chatId}/loja`);

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