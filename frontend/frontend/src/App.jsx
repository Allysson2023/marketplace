import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/Login/Login";
import Home from "./pages/Home/Home";
import Carrinho from "./pages/Carrinho/Carrinho";
import CadastrarProduto from "./pages/CadastrarProduto/CadastrarProduto";
import CadastrarLoja from "./pages/CadastrarLoja/CadastrarLoja";
import AtualizarPerfil from "./pages/AtualizarPerfil/AtualizarPerfil";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/carrinho" element={<Carrinho />} />
        <Route path="/cadastrar-produto" element={<CadastrarProduto/>} />
        <Route path="/cadastrar-loja" element={<CadastrarLoja/>} />
        <Route path="/atualizar-perfil" element={<AtualizarPerfil />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;