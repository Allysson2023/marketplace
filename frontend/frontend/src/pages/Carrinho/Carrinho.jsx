import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Carrinho.css";

function Carrinho() {

  const navigate = useNavigate();

  const [carrinho, setCarrinho] = useState([]);

  const token = localStorage.getItem("token");

  const [modalAberto, setModalAberto] = useState(false);
const [tipoPedido, setTipoPedido] = useState("entrega");

const [form, setForm] = useState({
  nome: "",
  endereco: "",
  numero: "",
  bairro: "",
  pagamento: "",
  cpf: ""
});

  useEffect(() => {

    fetch("http://localhost:3000/api/cart", {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then(res => res.json())
      .then(data => {

        console.log(data);

        if(Array.isArray(data)){
          setCarrinho(data);
        }

      })
      .catch(err => console.log(err));

  }, [token]);

  const total = carrinho.reduce((acc, item) => {
    return acc + (Number(item.preco) * item.quantidade);
  }, 0);

const aumentar = async (id) => {

  try {

    const response = await fetch(
      `http://localhost:3000/api/cart/increase/${id}`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    const data = await response.json();

    // 🔥 Se backend bloquear
    if (!response.ok) {

      alert(data.message);

      return;
    }

    // ✅ Atualiza frontend
    setCarrinho(prev =>
      prev.map(item =>
        item.product_id === id
          ? { ...item, quantidade: item.quantidade + 1 }
          : item
      )
    );

  } catch (err) {

    console.log(err);

  }

};

const diminuir = async (id) => {
  try {
    const res = await fetch(
      `http://localhost:3000/api/cart/decrease/${id}`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    const data = await res.json();

    if (!res.ok) {
      alert(data.message);
      return;
    }

    setCarrinho(prev =>
      prev
        .map(item =>
          item.product_id === id
            ? { ...item, quantidade: item.quantidade - 1 }
            : item
        )
        .filter(item => item.quantidade > 0)
    );

  } catch (err) {
    console.log(err);
  }
};

const remover = (id) => {

  fetch(`http://localhost:3000/api/cart/delete/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
  .then(() => {

    setCarrinho(prev =>
      prev.filter(item => item.product_id !== id)
    );

  });

};

const limparCarrinho = () => {

  fetch("http://localhost:3000/api/cart/clear", {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
  .then(() => setCarrinho([]));

};

const possuiProdutoIndisponivel = carrinho.some(
  item => item.estoque <= 0
);


async function finalizarCompra() {

  if (carrinho.length === 0) {
  return alert("Carrinho vazio");
}

  try {

    const response = await fetch("http://localhost:3000/api/pedidos", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        loja_id: carrinho[0].loja_id,
        total,
        produtos: carrinho.map(item => ({
          produto_id: item.product_id,
          quantidade: item.quantidade,
          preco: item.preco
        })),
        tipoPedido,
        dadosEntrega: form
      })
    });

    const data = await response.json();

    if (response.ok) {

      await fetch("http://localhost:3000/api/cart/clear", {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setCarrinho([]);
      setModalAberto(false);
setForm({
  nome: "",
  endereco: "",
  numero: "",
  bairro: "",
  pagamento: "",
  cpf: ""
});

      navigate("/meus-pedidos");

    } else {
      alert(data.message);
    }

  } catch (error) {
    console.log(error);
  }
}
  return (

    <div className="pagina-carrinho">

      <div className="topo-carrinho">

        <button
          className="btn-voltar"
          onClick={() => navigate(-1)}
        >
          ← Voltar
        </button>

        <h1>Meu Carrinho</h1>

      </div>

      {carrinho.length === 0 ? (

        <div className="cart-vazio">

          <h2>Seu carrinho está vazio</h2>

        </div>

      ) : (

        <>
        
          <div className="lista-carrinho">

            <button
  className="btn-limpar"
  onClick={limparCarrinho}
>
  🧹 Limpar Carrinho
</button>

            {carrinho.map((item) => (

              <div
  key={item.product_id}
  className={`card-carrinho ${
    item.estoque <= 0 ? "indisponivel-card" : ""
  }`}
>

                <img
                  src={`http://localhost:3000/uploads/produtos/${item.imagem}`}
                  alt={item.nome}
                />

                <div className="info-carrinho">

                  <h3>{item.nome}</h3>

                  {
  item.estoque <= 0 ? (
    <p className="indisponivel">
      Produto indisponível
    </p>
  ) : (
    <p className="estoque">
  Estoque disponível: {item.estoque}
</p>
  )
}

                  <span>
                    R$ {item.preco}
                  </span>

                </div>

                <div className="actions">

  <button className="btn-menos" onClick={() => diminuir(item.product_id)}>
    -
  </button>

  <span>{item.quantidade}</span>

<button
className="btn-mais"
  onClick={() => aumentar(item.product_id)}
  disabled={
  item.quantidade >= item.estoque ||
  item.estoque <= 0
}
>
  +
</button>

  <button className="btn-delete" onClick={() => remover(item.product_id)}>
    🗑
  </button>

</div>

              </div>

            ))}

          </div>

          <div className="footer-carrinho">

            <h2>
              Total: R$ {total.toFixed(2)}
            </h2>

            <button
  className="btn-finalizar"
  disabled={possuiProdutoIndisponivel}
  onClick={() => setModalAberto(true)}
>
  {
    possuiProdutoIndisponivel
      ? "Produto indisponível no carrinho"
      : "Finalizar Compra"
  }
</button>

          </div>

        </>

      )}

{modalAberto && (
  <div className="modal-overlay">

    <div className="modal">

      <h2>Finalizar Pedido</h2>

      {/* tipo pedido */}
      <div className="opcoes">
        <button onClick={() => setTipoPedido("entrega")}>
          Entrega
        </button>

        <button
  onClick={() => {
    setTipoPedido("retirada");

    setForm({
      nome: "",
      endereco: "",
      numero: "",
      bairro: "",
      pagamento: "",
      cpf: ""
    });
  }}
>
  Retirada
</button>
      </div>

      {/* ENTREGA */}
      {tipoPedido === "entrega" && (
        <>
          <input
          value={form.nome}
            placeholder="Nome do cliente"
            onChange={(e) => setForm({...form, nome: e.target.value})}
          />

          <input
          value={form.endereco}
            placeholder="Endereço"
            onChange={(e) => setForm({...form, endereco: e.target.value})}
          />

          <input
          value={form.numero}
            placeholder="Número"
            onChange={(e) => setForm({...form, numero: e.target.value})}
          />

          <input
          value={form.bairro}
            placeholder="Bairro"
            onChange={(e) => setForm({...form, bairro: e.target.value})}
          />

          <select
  value={form.pagamento}
  onChange={(e) => setForm({...form, pagamento: e.target.value})}
>
  <option value="">Selecione</option>
  <option value="pix">Pix</option>
  <option value="dinheiro">Dinheiro</option>
  <option value="cartao">Cartão</option>
</select>
        </>
      )}

      {/* RETIRADA */}
      {tipoPedido === "retirada" && (
        <>
          <input
          value={form.nome}
            placeholder="Nome de quem vai retirar"
            onChange={(e) => setForm({...form, nome: e.target.value})}
          />

          <input
  value={form.cpf}
            placeholder="CPF (confirmação)"
            onChange={(e) => setForm({...form, cpf: e.target.value})}
          />
        </>
      )}

      <div className="modal-botoes">

        <button onClick={() => setModalAberto(false)}>
          Cancelar
        </button>

        <button onClick={finalizarCompra}>
          Confirmar Pedido
        </button>

      </div>

    </div>

  </div>
)}

    </div>
  );

}

export default Carrinho;