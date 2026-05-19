import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import socket from "../../socket";
import "./ChatCliente.css";

function ChatCliente() {

    const { chatId } = useParams();

    const [mensagem, setMensagem] = useState("");
    const [mensagens, setMensagens] = useState([]);

    const token = localStorage.getItem("token");



    // 🟢 ENTRAR NO CHAT + SOCKET (SEM DUPLICAR)
    useEffect(() => {

        if (!chatId) return;

        const entrar = () => {
            socket.emit("entrar_chat", chatId);
        };

        if (socket.connected) {
            entrar();
        } else {
            socket.on("connect", entrar);
        }

        const handleMessage = (msg) => {
            setMensagens(prev => [...prev, msg]);
        };

        socket.on("nova_mensagem", handleMessage);

        return () => {
            socket.off("connect", entrar);
            socket.off("nova_mensagem", handleMessage);
        };

    }, [chatId]);



    // 🟢 CARREGAR MENSAGENS
    useEffect(() => {

        if (!chatId) return;

        fetch(`http://localhost:3000/api/chat/${chatId}/mensagens`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
        .then(res => res.json())
        .then(data => setMensagens(data))
        .catch(err => console.log(err));

    }, [chatId, token]);



    // 🟢 ENVIAR MENSAGEM
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

            <div className="chat-header">
                Conversa com a Loja
            </div>

            <div className="chat-mensagens">

                {mensagens.map((msg, index) => (

                    <div
                        key={index}
                        className={`mensagem ${msg.remetente_tipo}`}
                    >

                        <div className="texto-mensagem">
                            {msg.mensagem}
                        </div>

                    </div>

                ))}

            </div>

            <div className="chat-input-area">

                <input
                    value={mensagem}
                    onChange={(e) => setMensagem(e.target.value)}
                    placeholder="Digite sua mensagem..."
                />

                <button onClick={enviarMensagem}>
                    Enviar
                </button>

            </div>

        </div>

    );
}

export default ChatCliente;