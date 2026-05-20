import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import socket from "../../socket";
import "./ChatCliente.css";

function ChatCliente() {

    const { chatId } = useParams();

    const [mensagem, setMensagem] = useState("");
    const [mensagens, setMensagens] = useState([]);

    const token = localStorage.getItem("token");

    const mensagensRef = useRef(null);

    // ===============================
    // ENTRAR NO CHAT SOCKET
    // ===============================
    useEffect(() => {

        if (!chatId) return;

        socket.emit("entrar_chat", chatId);

    }, [chatId]);

    // ===============================
    // CARREGAR MENSAGENS
    // ===============================
    useEffect(() => {

        if (!chatId || !token) return;

        fetch(
            `http://localhost:3000/api/chat/${chatId}/mensagens`,
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        )
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

            setMensagens(prev => {

                const existe = prev.some(m => m.id === msg.id);
                if (existe) return prev;

                return [...prev, msg];

            });

        };

        socket.on("nova_mensagem", handleMessage);

        return () => socket.off("nova_mensagem", handleMessage);

    }, []);

    // ===============================
    // SCROLL
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
    async function enviarMensagem() {

        if (!mensagem.trim()) return;

        await fetch(
            "http://localhost:3000/api/chat/mensagem",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    chat_id: chatId,
                    mensagem,
                    tipo: "texto",
                    remetente_tipo: "cliente"
                })
            }
        );

        setMensagem("");
    }

    return (
        <div className="chat-container">

            <div className="chat-header">
                💬 Conversa
            </div>

            <div
                ref={mensagensRef}
                className="chat-mensagens"
            >

                {mensagens.map(msg => (
                    <div
                        key={msg.id}
                        className={`mensagem ${msg.remetente_tipo}`}
                    >
                        {msg.mensagem}
                    </div>
                ))}

            </div>

            <div className="chat-input-area">

                <input
                    value={mensagem}
                    onChange={(e) => setMensagem(e.target.value)}
                    placeholder="Digite sua mensagem..."
                    onKeyDown={(e) =>
                        e.key === "Enter" && enviarMensagem()
                    }
                />

                <button onClick={enviarMensagem}>
                    Enviar
                </button>

            </div>

        </div>
    );
}

export default ChatCliente;