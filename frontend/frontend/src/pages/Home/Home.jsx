import { useEffect, useState } from "react";
import "./Home.css";
import { useNavigate } from "react-router-dom";

function sair(){
  localStorage.removeItem("token");
  window.location.href = "/login";
}

function Home() {
  const [lojas, setLojas] = useState([]);
  const [produtos, setProdutos] = useState([]);
  const [menuAberto, setMenuAberto] = useState(false);
  const [modalSair, setModalSair] = useState(false);
  const [categorias, setCategorias] = useState([]);
  const navigate = useNavigate();
  const [categoriaSelecionada, setCategoriaSelecionada] = useState("");
  const [busca, setBusca] = useState("");

  const token = localStorage.getItem("token");

  if (!token) {
    window.location.href = "/login";
    return null;
  }

useEffect(() => {

    fetch("http://localhost:3000/api/categories")
    .then(res => res.json())
    .then(data => setCategorias(data));

}, [token]);

 useEffect(() => {

    fetch(`http://localhost:3000/api/stores?busca=${busca}`, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    })
    .then(res => {

        if(res.status === 401){

            localStorage.removeItem("token");

            window.location.href = "/login";

            return;
        }

        return res.json();

    })
    .then(data => {

        if(data){
            setLojas(data);
        }

    });

}, [busca, token]);

  useEffect(() => {

    let url = `http://localhost:3000/api/products?busca=${busca}`;

    if(categoriaSelecionada){
        url += `&categoria=${categoriaSelecionada}`;
    }

    fetch(url, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    })
    .then(res => {

        if(res.status === 401){

            localStorage.removeItem("token");

            window.location.href = "/login";

            return;
        }

        return res.json();

    })
    .then(data => {

        if(data){
            setProdutos(data);
        }

    });

}, [categoriaSelecionada, busca, token]);

  return (
    <div className="home">

      {/* 🔝 TOPO */}
      <header className="topo">
        <h2>Economica</h2>
        
      <div className="acoes-topo">

        <input
    type="text"
    placeholder="Buscar lojas ou produtos..."
    value={busca}
    onChange={(e) => setBusca(e.target.value)}
/>

        <button onClick={()=> setModalSair(true)} className="btn-sair" >Sair</button>
        <button 

        onClick={() => setMenuAberto(!menuAberto)}
        className="btn-mais" > + </button>
     
      </div>
      </header>
      {menuAberto && (
        <div className="menu-dropdown">
          <a href="/cadastrar-produto">
            Cadastrar Produto
          </a>

          <a href="/atualizar-perfil">
            Atualizar Perfil
          </a>

        </div>
      )}


      {/* 🏬 CARROSSEL DE LOJAS */}
      <h3 className="titulo-secao">Nossas Lojas</h3>

      <div className="carrossel" >
        {lojas.map(loja => (
          <div key={loja.id} className="card-loja"
          onClick={() => navigate(`/store/${loja.id}`)}>

            <img 
  src={
    loja.imagem
      ? `http://localhost:3000/uploads/lojas/${loja.imagem}`
      : "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRl55ZXLSARGsTv4qgCQBC_UD8wwSrV-3I-qg&s"
  }
  alt={loja.nome}
/>
            <p>{loja.nome}</p>
          </div>
        ))}
      </div>

      <div className="menu">

    <span
        className={`categoria-item ${categoriaSelecionada === "" ? "categoria-ativa" : ""}`}
        onClick={() => setCategoriaSelecionada("")}
    >
        Todos
    </span>

    {categorias.map(categoria => (

        <span
            key={categoria.id}
            className={`categoria-item ${
                categoriaSelecionada === categoria.nome
                ? "categoria-ativa"
                : ""
            }`}
            onClick={() => setCategoriaSelecionada(categoria.nome)}
        >
            {categoria.nome}
        </span>

    ))}

</div>

        <h2 className="produto-titulo">Promoção</h2>


        <div className="produto-grid">

  {produtos.map(produto => (

    <div key={produto.id} className="card-produto">

      <img
        src={
          produto.imagem
            ? `http://localhost:3000/uploads/produtos/${produto.imagem}`
            : "https://via.placeholder.com/300"
        }
        alt={produto.nome}
      />

      <h3>{produto.nome}</h3>

      <p className="nome-loja">
  {produto.nomeLoja}
</p>

      <div className="precos">

        {produto.preco_antigo && (
          <span className="preco-antigo">
            R$ {produto.preco_antigo}
          </span>
        )}

        <span className="preco-atual">
          R$ {produto.preco}
        </span>

      </div>

    </div>

  ))}

</div>


{modalSair && (
  <div className="modal-overlay">

    <div className="modal-sair">

      <h3>Deseja sair?</h3>

      <p>Você realmente deseja encerrar a sessão?</p>

      <div className="modal-botoes">

        <button
          className="btn-cancelar"
          onClick={() => setModalSair(false)}
        >
          Cancelar
        </button>

        <button
          className="btn-confirmar"
          onClick={sair}
        >
          Sair
        </button>

      </div>

    </div>

  </div>
)}

    </div>
  );
}

export default Home;