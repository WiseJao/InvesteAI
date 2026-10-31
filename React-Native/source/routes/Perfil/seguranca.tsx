import ListaPesquisavel from './components/listaPesquisavel';

const itens = ['Alterar senha', 'Alterar email', 'Alterar número', 'Políticas de privacidade'];

export default function Seguranca() {
    return <ListaPesquisavel titulo="Segurança" itens={itens} />;
}
