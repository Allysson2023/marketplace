import { useEffect, useState } from "react";
import "./Home.css";

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

  const token = localStorage.getItem("token");

  if (!token) {
    window.location.href = "/login";
    return null;
  }

useEffect(() => {

    fetch("http://localhost:3000/api/categories")
    .then(res => res.json())
    .then(data => setCategorias(data));

}, []);

  useEffect(() => {
    fetch("http://localhost:3000/api/stores")
      .then(res => res.json())
      .then(data => setLojas(data));
  }, []);

  useEffect(() => {
    fetch("http://localhost:3000/api/products")
    .then(res => res.json())
    .then(data => setProdutos(data));
  }, []);

  return (
    <div className="home">

      {/* 🔝 TOPO */}
      <header className="topo">
        <h2>Economica</h2>
        
      <div className="acoes-topo">

        <input 
          type="text" 
          placeholder="Buscar lojas..." 
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

      <div className="menu">

    {categorias.map(categoria => (

        <span key={categoria.id}>
            {categoria.nome}
        </span>

    ))}

</div>

      {/* 🏬 CARROSSEL DE LOJAS */}
      <h3 className="titulo-secao">Nossas Lojas</h3>

      <div className="carrossel" >
        {lojas.map(loja => (
          <div key={loja.id} className="card-loja">

            <img 
              src={loja.imagem || "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRl55ZXLSARGsTv4qgCQBC_UD8wwSrV-3I-qg&s"} 
              alt={loja.nome}
            />
            <p>{loja.nome}</p>
          </div>
        ))}
      </div>

        <h2 className="produto-titulo">Promoção</h2>

        <div className="produto-grid">
          {produtos.map(produto => (
            <div key={produto.id} className="card-produto">

            <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSfRIKWWU4HDicibTE5El0JVkVIdtjTt0FYYg&s" alt="img" />

              <p>{produto.nome}</p>

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