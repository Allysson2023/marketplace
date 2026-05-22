import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

function StoreDashboard() {

  const { id } = useParams();

  const [resumo, setResumo] = useState(null);

  useEffect(() => {

  console.log("ID:", id);

  fetch(`http://localhost:3000/api/stores/${id}/dashboard`)
    .then(async (res) => {

      console.log("STATUS:", res.status);

      const text = await res.text();
      console.log("RAW RESPONSE:", text);

      return JSON.parse(text);
    })
    .then(data => {
      console.log("DADOS:", data);
      setResumo(data);
    })
    .catch(err => {
      console.log("ERRO REAL:", err);
    });

}, [id]);

  return (
    <div style={{ padding: 20 }}>

      <h1>📊 Dashboard da Loja</h1>

      {!resumo ? (
        <p>Carregando dados...</p>
      ) : (
        <>
          <h2>💰 Hoje: R$ {resumo.faturamentoHoje}</h2>
          <h2>📅 Mês: R$ {resumo.faturamentoMes}</h2>
          <h2>📈 Ano: R$ {resumo.faturamentoAno}</h2>

          <h3>🛒 Produtos mais vendidos:</h3>
          <ul>
            {resumo.topProdutos.map((p) => (
              <li key={p.id}>
                {p.nome} - {p.quantidade}
              </li>
            ))}
          </ul>

          <h3>📦 Estoque baixo:</h3>
          <ul>
            {resumo.estoqueBaixo.map((p) => (
              <li key={p.id}>
                {p.nome} ({p.estoque})
              </li>
            ))}
          </ul>

        </>
      )}

    </div>
  );
}

export default StoreDashboard;