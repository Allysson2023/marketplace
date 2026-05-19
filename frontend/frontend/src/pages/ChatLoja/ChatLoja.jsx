import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import socket from "../../socket";

function ChatLoja() {

    const { chatId } = useParams();

    const [mensagens, setMensagens] = useState([]);
    const [texto, setTexto] = useState("");
    const [lojaId, setLojaId] = useState(null);

    const token = localStorage.getItem("token");



    // ===============================
    // PEGAR DADOS DA LOJA
    // ===============================
    useEffect(() => {

        fetch("http://localhost:3000/api/minha-loja", {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
        .then(res => res.json())
        .then(data => {

            if (data?.id) {
                setLojaId(data.id);
            }

        })
        .catch(err => {
            console.log("Erro ao carregar loja:", err);
        });

    }, [token]);



    // ===============================
    // ENTRAR NA SALA SOCKET
    // ===============================
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



    // ===============================
    // CARREGAR MENSAGENS
    // ===============================
    useEffect(() => {

        if (!chatId) return;

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

        })
        .catch(err => {
            console.log("Erro ao carregar mensagens:", err);
        });

    }, [chatId, token]);



    // ===============================
    // SOCKET TEMPO REAL
    // ===============================
    useEffect(() => {

        const handleMessage = (msg) => {

            setMensagens(prev => {

                const jaExiste = prev.some(
                    m => m.id === msg.id
                );

                if (jaExiste) {
                    return prev;
                }

                return [...prev, msg];

            });

        };

        socket.on("nova_mensagem", handleMessage);

        return () => {
            socket.off("nova_mensagem", handleMessage);
        };

    }, []);



    // ===============================
    // ENVIAR MENSAGEM
    // ===============================
    async function enviar() {

        if (!texto.trim()) return;

        try {

            const response = await fetch(
                "http://localhost:3000/api/chat/mensagem",
                {
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
                        loja_id: lojaId
                    })
                }
            );

            const data = await response.json();

            console.log("Mensagem enviada:", data);

            setTexto("");

        } catch (err) {

            console.log(
                "Erro ao enviar mensagem:",
                err
            );

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

                {mensagens.map((m) => (

                    <div
                        key={m.id}
                        style={{
                            display: "flex",
                            justifyContent:
                                m.remetente_tipo === "loja"
                                    ? "flex-end"
                                    : "flex-start",
                            marginBottom: 10
                        }}
                    >

                        <div style={{
                            padding: "10px 14px",
                            background:
                                m.remetente_tipo === "loja"
                                    ? "#ff4d4d"
                                    : "#e5e5e5",
                            color:
                                m.remetente_tipo === "loja"
                                    ? "#fff"
                                    : "#000",
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