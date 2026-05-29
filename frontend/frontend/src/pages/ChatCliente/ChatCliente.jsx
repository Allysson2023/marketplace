import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate,  useLocation  } from "react-router-dom";
import socket from "../../socket";
import "./ChatCliente.css";

function ChatCliente() {

    const { chatId } = useParams();
    const navigate = useNavigate();

    const [mensagem, setMensagem] = useState("");
    const [mensagens, setMensagens] = useState([]);
    const [chatInfo, setChatInfo] = useState(null);

const jaEnviouInicial = useRef(false);
    const token = localStorage.getItem("token");

    const mensagensRef = useRef(null);

    const location = useLocation();
const mensagemInicial = location.state?.mensagemInicial;

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
    chat_id: chatId
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

    socket.emit("entrar_chat", { chatId });

    return () => {
        socket.emit("sair_chat", { chatId });
    };
}, [chatId]);

    // ===============================
    // SOCKET MENSAGENS EM TEMPO REAL
    // ===============================
    useEffect(() => {
 
        const handleMessage = (msg) => {

            setMensagens(prev => {

                const existe = prev.some(
    m => m.id === msg.id || 
         (m.temp_id && m.temp_id === msg.temp_id)
);
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
            mensagensRef.current?.scrollTo({
    top: mensagensRef.current.scrollHeight,
    behavior: "smooth"
});
        }

    }, [mensagens]);

    // ===============================
    // ENVIAR MENSAGEM
    // ===============================
    async function enviarMensagem() {
    if (!mensagem.trim()) return;

    try {
        const res = await fetch("http://localhost:3000/api/chat/mensagem", {
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

        if (!res.ok) throw new Error("Erro ao enviar");
        // 🔥 adiciona imediatamente na tela
setMensagens(prev => [
    ...prev,
    {
        id: Date.now(),
        mensagem,
        remetente_tipo: "cliente",
        criado_em: new Date().toISOString()
    }
]);

        setMensagem("");

    } catch (err) {
        console.log(err);
        alert("Erro ao enviar mensagem");
    }
}

useEffect(() => {
    if (!mensagemInicial || !chatId || !token) return;
    if (jaEnviouInicial.current) return;

    const enviarInicial = async () => {
        try {
            await fetch("http://localhost:3000/api/chat/mensagem", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    chat_id: chatId,
                    mensagem: mensagemInicial,
                    tipo: "texto",
                    remetente_tipo: "cliente"
                })
            });
            // 🔥 adiciona imediatamente na tela
setMensagens(prev => [
    ...prev,
    {
        id: Date.now(),
        mensagem: mensagemInicial,
        remetente_tipo: "cliente",
        criado_em: new Date().toISOString()
    }
]);

            jaEnviouInicial.current = true; // 🔥 bloqueia duplicação
        } catch (err) {
            console.log(err);
        }
    };

    enviarInicial();
}, [mensagemInicial, chatId, token]);

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