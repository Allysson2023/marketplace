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

    async function loadChat() {
        try {

            const [msgRes, chatRes] = await Promise.all([
                fetch(`http://localhost:3000/api/chat/${chatId}/mensagens`, {
                    headers: { Authorization: `Bearer ${token}` }
                }),
                fetch(`http://localhost:3000/api/chat/${chatId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                })
            ]);

            const msgs = await msgRes.json();
            const chat = await chatRes.json();

            if (Array.isArray(msgs)) {
                setMensagens(msgs);
            }

            setChatInfo(chat);

        } catch (err) {
            console.log(err);
        }
    }

    loadChat();

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

    if (!chatId) return;

    const handleMessage = (msg) => {

        if (!msg?.chat_id) return;
        if (Number(msg.chat_id) !== Number(chatId)) return;

        setMensagens(prev => {

            const exists = prev.some(m => {

                // 🔥 fallback seguro (NUNCA depende só de id)
                return (
                    (m.id && msg.id && m.id === msg.id) ||
                    (m.temp_id && msg.temp_id && m.temp_id === msg.temp_id) ||
                    (m.mensagem === msg.mensagem &&
                     m.remetente_tipo === msg.remetente_tipo &&
                     Math.abs(
                        new Date(m.criado_em) - new Date(msg.criado_em)
                     ) < 2000)
                );
            });

            if (exists) return prev;

            return [...prev, msg];
        });
    };

    socket.on("nova_mensagem", handleMessage);

    return () => socket.off("nova_mensagem", handleMessage);

}, [chatId]);

    // ===============================
    // SCROLL AUTOMÁTICO
    // ===============================
    useEffect(() => {

    const el = mensagensRef.current;
    if (!el) return;

    const nearBottom =
        el.scrollHeight - el.scrollTop - el.clientHeight < 120;

    if (nearBottom) {
        el.scrollTo({
            top: el.scrollHeight,
            behavior: "smooth"
        });
    }

}, [mensagens]);

    // ===============================
    // ENVIAR MENSAGEM
    // ===============================
    async function enviarMensagem() {
    if (!mensagem.trim()) return;

    const tempMsg = {
        id: Date.now(),
        mensagem,
        remetente_tipo: "cliente",
        criado_em: new Date().toISOString()
    };

    // 🔥 MOSTRA INSTANTE (OTIMISTA)
    setMensagens(prev => [...prev, tempMsg]);

    try {
        const res = await fetch("http://localhost:3000/api/chat/mensagem", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({
                chat_id: Number(chatId),
                mensagem,
                tipo: "texto",
                remetente_tipo: "cliente"
            })
        });

        const data = await res.json();

        // 🔥 opcional: atualizar ID real
        setMensagens(prev =>
            prev.map(m =>
                m.id === tempMsg.id
                    ? { ...m, id: data.id }
                    : m
            )
        );

        setMensagem("");

    } catch (err) {
        console.log(err);
        alert("Erro ao enviar mensagem");
    }
}

useEffect(() => {

    if (!mensagemInicial || !chatId || !token) return;

    const enviarInicial = async () => {

        if (jaEnviouInicial.current) return;

        jaEnviouInicial.current = true;

        try {
            await fetch("http://localhost:3000/api/chat/mensagem", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    chat_id: Number(chatId),
                    mensagem: mensagemInicial,
                    tipo: "texto",
                    remetente_tipo: "cliente"
                })
            });

            setMensagens(prev => [
                ...prev,
                {
                    id: Date.now(),
                    temp_id: Date.now(),
                    chat_id: Number(chatId),
                    mensagem: mensagemInicial,
                    remetente_tipo: "cliente",
                    criado_em: new Date().toISOString()
                }
            ]);

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
        {chatInfo?.loja_nome || "Loja"}
    </b>

</div>

            {/* MENSAGENS */}
            <div
                ref={mensagensRef}
                className="chat-mensagens"
            >

                {mensagens.map((msg) => {

                    const hora = new Date(msg.criado_em )
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