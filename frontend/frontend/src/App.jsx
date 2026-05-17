import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/Login/Login";
import Home from "./pages/Home/Home";
import Carrinho from "./pages/Carrinho/Carrinho";
import CadastrarProduto from "./pages/CadastrarProduto/CadastrarProduto";
import CadastrarLoja from "./pages/CadastrarLoja/CadastrarLoja";
import AtualizarPerfil from "./pages/AtualizarPerfil/AtualizarPerfil";
import Store from "./pages/Store/Store";
import ProductDetalhes from "./pages/ProductDetalhes/ProductDetalhes";
import AdminProdutos from "./pages/AdminProdutos/AdminProdutos";
import EditarProduto from "./pages/EditarProduto/EditarProduto";
import EditarLoja from "./pages/EditarLoja/EditarLoja";
import PedidoStatus from "./pages/PedidoStatus/PedidoStatus";
import MeusPedidos from "./pages/MeusPedidos/MeusPedidos";
import PainelPedidos from "./pages/PainelPedidos/PainelPedidos";
import AdminPedido from "./pages/AdminPedido/AdminPedido";
import Notificacoes from "./pages/Notificacoes/Notificacoes";
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
        <Route path="/store/:id/admin/produtos" element={<AdminProdutos />} />
        <Route path="/admin/produto/:id" element={<EditarProduto />} />
        <Route path="/editar-loja/:id" element={<EditarLoja />} />
        <Route path="/pedido/:id" element={<PedidoStatus />}/>
<Route path="/meus-pedidos" element={<MeusPedidos />} />
<Route path="/store/:id/pedidos" element={<PainelPedidos />} />
<Route
  path="/admin/pedido/:id"
  element={<AdminPedido />}
/>
<Route path="/notificacoes" element={<Notificacoes />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;