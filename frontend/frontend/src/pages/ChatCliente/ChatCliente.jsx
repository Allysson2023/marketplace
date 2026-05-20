import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import socket from "../../socket";
import "./ChatCliente.css";

function ChatCliente() {

    const { chatId } = useParams();
    const navigate = useNavigate();

    const [mensagem, setMensagem] = useState("");
    const [mensagens, setMensagens] = useState([]);
    const [chatInfo, setChatInfo] = useState(null);

    const token = localStorage.getItem("token");

    const mensagensRef = useRef(null);

    // ===============================
    // CARREGAR MENSAGENS + CHAT INFO
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

            if (!Array.isArray(data)) return;

            setMensagens(data);

            if (data.length > 0) {
                const primeira = data[0];

                setChatInfo({
                    cliente_id: primeira.cliente_id,
                    loja_id: primeira.loja_id,
                    pedido_id: primeira.chat_id
                });
            }

        })
        .catch(err => console.log(err));

    }, [chatId, token]);

    // ===============================
    // SOCKET ENTRAR NO CHAT
    // ===============================
    useEffect(() => {
        if (!chatId) return;

        socket.emit("entrar_chat", chatId);
    }, [chatId]);

    // ===============================
    // SOCKET MENSAGENS EM TEMPO REAL
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
    async function enviarMensagem() {

        if (!mensagem.trim()) return;

        await fetch("http://localhost:3000/api/chat/mensagem", {
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
        });

        setMensagem("");
    }

    return (
        <div className="chat-container">

            {/* HEADER */}
            <div className="chat-header">

                <button onClick={() => navigate(-1)}>
                    ← Voltar
                </button>

                💬 Conversando com{" "}
                <b>
                    {chatInfo?.loja_id
                        ? `Loja #${chatInfo.loja_id}`
                        : "Loja"}
                </b>

                {" - Pedido #" + chatId}
            </div>

            {/* MENSAGENS */}
            <div
                ref={mensagensRef}
                className="chat-mensagens"
            >

                {mensagens.map((msg) => {

                    const hora = new Date(msg.criado_em || Date.now())
                        .toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit"
                        });

                    return (
                        <div
                            key={msg.id}
                            className={`mensagem ${msg.remetente_tipo}`}
                        >

                            <div className="texto-mensagem">
                                {msg.mensagem}
                            </div>

                            <div className="msg-hora">
                                {hora}
                            </div>

                        </div>
                    );
                })}

            </div>

            {/* INPUT */}
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