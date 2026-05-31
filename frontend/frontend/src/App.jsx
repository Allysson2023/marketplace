import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect } from "react";

import socket from "./socket";

import Login from "./pages/Login/Login";
import Home from "./pages/Home/Home";
import ChatCliente from "./pages/ChatCliente/ChatCliente";
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
import ChatLoja from "./pages/ChatLoja/ChatLoja";
import ChatListLoja from "./pages/ChatListaLoja/ChatListLoja";
import StoreDashboard from "./pages/StoreDashboard/StoreDashboard";
import somNotificacao from "./assets/sounds/notification.mp3";
import MaisVendidos from "./pages/MaisVendidos/MaisVendidos";
import Estoque from "./pages/Estoque/Estoque";
import Financeiro from "./pages/Financeiro/Financeiro";
import Clientes from "./pages/Clientes/Clientes";
import Mensagens from "./pages/Mensagens/Mensagens";
import CadastroCliente from "./pages/CadastroCliente/CadastroCliente";
import AtualizarCliente from "./pages/AtualizarCliente/AtualizarCliente";

function App() {

  useEffect(() => {

    const user = JSON.parse(localStorage.getItem("user"));

    if (user?.id) {
      socket.emit("join", user.id);
    }

    const notificationSound = new Audio(somNotificacao);

    // ===============================
    // 🔥 NOTIFICAÇÃO GLOBAL CHAT + SISTEMA
    // ===============================
    const handleNovaMensagem = (msg) => {

      // evita erro se não tiver
      if (!msg) return;

      notificationSound.currentTime = 0;

      notificationSound.play().catch(() => {
        console.log("Som bloqueado pelo navegador");
      });
    };

    const handleNotificacao = (data) => {

      notificationSound.currentTime = 0;

      notificationSound.play().catch(() => {});
    };

    socket.on("nova_mensagem", handleNovaMensagem);
    socket.on("nova_notificacao", handleNotificacao);

    return () => {
      socket.off("nova_mensagem", handleNovaMensagem);
      socket.off("nova_notificacao", handleNotificacao);
    };

  }, []);

  return (
    <BrowserRouter>
      <Routes>

        <Route path="/" element={<Home />} />
        <Route path="/product/:id" element={<ProductDetalhes />} />
        <Route path="/login" element={<Login />} />
        <Route path="/carrinho" element={<Carrinho />} />
        <Route path="/cadastrar-produto" element={<CadastrarProduto />} />
        <Route path="/cadastrar-loja" element={<CadastrarLoja />} />
        <Route path="/atualizar-perfil" element={<AtualizarPerfil />} />
        <Route path="/store/:id" element={<Store />} />
        <Route path="/store/:id/admin/produtos" element={<AdminProdutos />} />
        <Route path="/admin/produto/:id" element={<EditarProduto />} />
        <Route path="/editar-loja/:id" element={<EditarLoja />} />
        <Route path="/pedido/:id" element={<PedidoStatus />} />
        <Route path="/meus-pedidos" element={<MeusPedidos />} />
        <Route path="/store/:id/pedidos" element={<PainelPedidos />} />
        <Route path="/admin/pedido/:id" element={<AdminPedido />} />
        <Route path="/notificacoes" element={<Notificacoes />} />
        <Route path="/chat/:chatId" element={<ChatCliente />} />
        
        <Route path="/loja/:id/chats" element={<ChatListLoja />} />
        <Route path="/chat/:chatId/loja" element={<ChatLoja />} />


        <Route path="/store/:id/dashboard" element={<StoreDashboard />} />
        <Route path="/store/:id/mais-vendidos" element={<MaisVendidos />}/>
        <Route path="/store/:id/estoque" element={<Estoque />}/>
        <Route path="/store/:id/financeiro" element={<Financeiro />}/>
        <Route path="/store/:id/clientes" element={<Clientes />}/>
        <Route path="/mensagens" element={<Mensagens />} />
        <Route path="/cadastro" element={<CadastroCliente />}/>
        <Route path="/atualizar-cliente/:id" element={<AtualizarCliente />}/>
      </Routes>

    </BrowserRouter>
  );
}

export default App;