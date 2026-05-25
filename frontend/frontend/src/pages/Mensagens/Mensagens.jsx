import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Mensagens.css";

function Mensagens() {
  const [conversas, setConversas] = useState([]);
  const navigate = useNavigate();

  const token = localStorage.getItem("token");

  useEffect(() => {
    fetch("http://localhost:3000/api/conversas", {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then(res => res.json())
      .then(data => setConversas(data))
      .catch(err => console.log(err));
  }, []);

  return (
    <div className="mensagens-container">
      <h2>📩 Minhas Conversas</h2>

      {conversas.length === 0 ? (
        <p>Nenhuma conversa ainda</p>
      ) : (
        conversas.map((c) => (
          <div
            key={c.id}
            className="chat-card"
            onClick={() => navigate(`/chat/${c.lojaId}`)}
          >
            <h3>{c.nomeLoja}</h3>
            <p>{c.ultimaMensagem}</p>
          </div>
        ))
      )}
    </div>
  );
}

export default Mensagens;