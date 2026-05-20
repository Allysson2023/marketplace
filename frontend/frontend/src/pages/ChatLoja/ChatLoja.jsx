import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import socket from "../../socket";

function ChatLoja() {

    const { chatId } = useParams();

    const [mensagens, setMensagens] = useState([]);
    const [texto, setTexto] = useState("");

    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user"));

    const mensagensRef = useRef(null);

    // ===============================
    // ENTRAR NO SOCKET DO CHAT
    // ===============================
    useEffect(() => {

        if (!chatId) return;

        socket.emit("entrar_chat", chatId);

    }, [chatId]);

    // ===============================
    // CARREGAR MENSAGENS (AO ENTRAR)
    // ===============================
    useEffect(() => {

        if (!chatId || !token) return;

        fetch(`http://localhost:3000/api/chat/${chatId}/mensagens`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
        .then(res => res.json())
        .then(data => {
            if (Array.isArray(data)) {
                setMensagens(data);
            }
        });

    }, [chatId, token]);

    // ===============================
    // SOCKET TEMPO REAL
    // ===============================
    useEffect(() => {

        const handleMessage = (msg) => {

            if (Number(msg.chat_id) === Number(chatId)) {

                setMensagens(prev => {
                    const existe = prev.some(m => m.id === msg.id);
                    if (existe) return prev;
                    return [...prev, msg];
                });

            }

        };

        socket.on("nova_mensagem", handleMessage);

        return () => socket.off("nova_mensagem", handleMessage);

    }, [chatId]);

    // ===============================
    // SCROLL AUTOMÁTICO
    // ===============================
    useEffect(() => {

        if (mensagensRef.current) {
            mensagensRef.current.scrollTop =
                mensagensRef.current.scrollHeight;
        }

    }, [mensagens]);

    // ===============================
    // ENVIAR MENSAGEM
    // ===============================
    async function enviar() {

        if (!texto.trim()) return;

        await fetch("http://localhost:3000/api/chat/mensagem", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({
                chat_id: chatId,
                mensagem: texto,
                tipo: "texto",
                remetente_tipo: "loja",
                loja_id: user?.loja_id
            })
        });

        setTexto("");
    }

    return (
        <div style={{ padding: 20 }}>

            <h2>💬 Chat Loja</h2>

            <div
                ref={mensagensRef}
                style={{
                    height: "70vh",
                    overflowY: "auto",
                    border: "1px solid #ddd",
                    padding: 10,
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px"
                }}
            >

                {mensagens.map(m => (
                    <div
                        key={m.id}
                        style={{
                            alignSelf:
                                m.remetente_tipo === "loja"
                                    ? "flex-end"
                                    : "flex-start",
                            background:
                                m.remetente_tipo === "loja"
                                    ? "#DCF8C6"
                                    : "#FFF",
                            padding: "8px 12px",
                            borderRadius: "10px",
                            maxWidth: "70%"
                        }}
                    >
                        {m.mensagem}
                    </div>
                ))}

            </div>

            <div style={{ display: "flex", marginTop: 10 }}>

                <input
                    value={texto}
                    onChange={e => setTexto(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && enviar()}
                    style={{ flex: 1, padding: 10 }}
                />

                <button onClick={enviar}>
                    Enviar
                </button>

            </div>

        </div>
    );
}

export default ChatLoja;