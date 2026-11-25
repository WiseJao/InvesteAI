import ListaPesquisavel from './components/listaPesquisavel';

const itens = ['Notificações', 'Tema', 'Digital', 'IA'].map((rotulo) => ({ rotulo, indisponivel: true }));

export default function Configuracoes() {
    return <ListaPesquisavel titulo="Configurações" itens={itens} />;
}
