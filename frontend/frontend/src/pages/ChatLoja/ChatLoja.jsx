import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import socket from "../../socket";

function ChatLoja() {

    const { chatId } = useParams();

    const [mensagens, setMensagens] = useState([]);
    const [texto, setTexto] = useState("");

    const token = localStorage.getItem("token");



    // 🟢 1. ENTRAR NA SALA (CORRIGIDO SOCKET CONNECT)
    useEffect(() => {

        if (!chatId) return;

        const entrarSala = () => {
            socket.emit("entrar_chat", chatId);
        };

        if (socket.connected) {
            entrarSala();
        } else {
            socket.on("connect", entrarSala);
        }

        return () => {
            socket.off("connect", entrarSala);
        };

    }, [chatId]);



    // 🟢 2. CARREGAR MENSAGENS DO BANCO
    useEffect(() => {

        if (!chatId) return;

        fetch(`http://localhost:3000/api/chat/${chatId}/mensagens`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
        .then(res => res.json())
        .then(data => setMensagens(data))
        .catch(err => console.log("Erro ao carregar mensagens:", err));

    }, [chatId, token]);



    // 🟢 3. TEMPO REAL (SOCKET)
    useEffect(() => {

        const handleMessage = (msg) => {
            setMensagens(prev => [...prev, msg]);
        };

        socket.on("nova_mensagem", handleMessage);

        return () => {
            socket.off("nova_mensagem", handleMessage);
        };

    }, []);



    // 🟢 4. ENVIAR MENSAGEM (LOJA)
    async function enviar() {

        if (!texto.trim()) return;

        try {

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
                    remetente_tipo: "loja"
                })
            });

            setTexto("");

        } catch (err) {
            console.log("Erro ao enviar mensagem:", err);
        }
    }



    return (

        <div style={{
            padding: 20,
            maxWidth: 600,
            margin: "0 auto"
        }}>

            <h2>💬 Chat da Loja</h2>



            {/* MENSAGENS */}
            <div style={{
                height: "70vh",
                overflowY: "auto",
                border: "1px solid #ddd",
                padding: 10,
                borderRadius: 10,
                background: "#fafafa"
            }}>

                {mensagens.map((m, i) => (

                    <div key={i} style={{
                        display: "flex",
                        justifyContent: m.remetente_tipo === "loja" ? "flex-end" : "flex-start",
                        marginBottom: 10
                    }}>

                        <div style={{
                            padding: "10px 14px",
                            background: m.remetente_tipo === "loja" ? "#ff4d4d" : "#e5e5e5",
                            color: m.remetente_tipo === "loja" ? "#fff" : "#000",
                            borderRadius: 12,
                            maxWidth: "70%",
                            wordBreak: "break-word"
                        }}>
                            {m.mensagem}
                        </div>

                    </div>

                ))}

            </div>



            {/* INPUT */}
            <div style={{
                display: "flex",
                marginTop: 10,
                gap: 10
            }}>

                <input
                    value={texto}
                    onChange={(e) => setTexto(e.target.value)}
                    placeholder="Digite sua mensagem..."
                    style={{
                        flex: 1,
                        padding: 10,
                        borderRadius: 8,
                        border: "1px solid #ccc"
                    }}
                />

                <button
                    onClick={enviar}
                    style={{
                        padding: "10px 20px",
                        borderRadius: 8,
                        background: "#ff4d4d",
                        color: "#fff",
                        border: "none",
                        cursor: "pointer"
                    }}
                >
                    Enviar
                </button>

            </div>

        </div>

    );
}

export default ChatLoja;