import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

function Financeiro() {

  const { id } = useParams();
  const navigate = useNavigate();

  const [dados, setDados] = useState([]);

  useEffect(() => {
    fetch(`http://localhost:3000/api/stores/${id}/financeiro`)
      .then(r => r.json())
      .then(setDados);
  }, []);

  return (
    <div>

      <button className="btn-voltar" onClick={() => navigate(-1)}>
        ⬅ Voltar
      </button>

      <h1>💰 Financeiro</h1>

      {dados.map((d, i) => (
        <div key={i}>
          <p>{d.data}</p>
          <strong>R$ {d.total}</strong>
        </div>
      ))}

    </div>
  );
}

export default Financeiro;