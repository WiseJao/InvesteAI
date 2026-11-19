import ListaPesquisavel from './components/listaPesquisavel';

const itens = ['Notificações', 'Tema', 'Digital', 'IA'];

export default function Configuracoes() {
    return <ListaPesquisavel titulo="Configurações" itens={itens} />;
}
