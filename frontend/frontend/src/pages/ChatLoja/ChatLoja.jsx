import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import socket from "../../socket";
import "./ChatLoja.css";

function ChatLoja() {

    const { chatId } = useParams();
    const navigate = useNavigate();

    const [mensagens, setMensagens] = useState([]);
    const [texto, setTexto] = useState("");

    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user"));

    const mensagensRef = useRef(null);

    // SOCKET
    useEffect(() => {
        socket.emit("entrar_chat", chatId);
    }, [chatId]);

    // CARREGAR MENSAGENS
    useEffect(() => {

        fetch(`http://localhost:3000/api/chat/${chatId}/mensagens`, {
            headers: { Authorization: `Bearer ${token}` }
        })
        .then(res => res.json())
        .then(data => {
            if (Array.isArray(data)) setMensagens(data);
        });

    }, [chatId, token]);

    // SOCKET REALTIME
    useEffect(() => {

        const handle = (msg) => {
            if (Number(msg.chat_id) === Number(chatId)) {
                setMensagens(prev => [...prev, msg]);
            }
        };

        socket.on("nova_mensagem", handle);

        return () => socket.off("nova_mensagem", handle);

    }, [chatId]);

    // SCROLL
    useEffect(() => {
        if (mensagensRef.current) {
            mensagensRef.current.scrollTop =
                mensagensRef.current.scrollHeight;
        }
    }, [mensagens]);

    // ENVIAR
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

        <div className="chat-loja-container">

            {/* HEADER */}
            <div className="chat-loja-header">

                <button
                    className="btn-voltar"
                    onClick={() => navigate(-1)}
                >
                    ← Voltar
                </button>

                <h2>💬 Chat da Loja</h2>

            </div>

            {/* MENSAGENS */}
            <div className="chat-loja-mensagens" ref={mensagensRef}>

                {mensagens.map(m => (
                    <div
                        key={m.id}
                        className={`msg ${m.remetente_tipo}`}
                    >
                        {m.mensagem}
                    </div>
                ))}

            </div>

            {/* INPUT */}
            <div className="chat-loja-input">

                <input
                    value={texto}
                    onChange={e => setTexto(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && enviar()}
                    placeholder="Digite uma mensagem..."
                />

                <button onClick={enviar}>
                    Enviar
                </button>

            </div>

        </div>
    );
}

export default ChatLoja;