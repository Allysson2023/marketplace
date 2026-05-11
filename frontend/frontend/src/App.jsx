import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/Login/Login";
import Home from "./pages/Home/Home";
import Carrinho from "./pages/Carrinho/Carrinho";
import CadastrarProduto from "./pages/CadastrarProduto/CadastrarProduto";
import CadastrarLoja from "./pages/CadastrarLoja/CadastrarLoja";
import AtualizarPerfil from "./pages/AtualizarPerfil/AtualizarPerfil";
import Store from "./pages/Store/Store";
import ProductDetalhes from "./pages/ProductDetalhes/ProductDetalhes";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/product/:id" element={<ProductDetalhes />} />
        <Route path="/login" element={<Login />} />
        <Route path="/carrinho" element={<Carrinho />} />
        <Route path="/cadastrar-produto" element={<CadastrarProduto/>} />
        <Route path="/cadastrar-loja" element={<CadastrarLoja/>} />
        <Route path="/atualizar-perfil" element={<AtualizarPerfil />} />
        <Route path="/store/:id" element={<Store />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;