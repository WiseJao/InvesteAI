import Layout from '../../shared/layout';
import Estado from '../../shared/estado';
import { useCarregar } from '../../shared/useCarregar';
import { listarMovimentacoes } from '../../services/gastos';
import ListaGastos from './components/listaGastos';
import { paraLinhaPorCategoria } from './dados';

export default function GastosVariaveis() {
    const { dados, carregando, erro, recarregar } = useCarregar(() => listarMovimentacoes('EXPENSE_VARIABLE'));

    return (
        <Layout titulo="Gastos variáveis" subtitulo="Gastos do mês, fora o fixo" voltar>
            <Estado carregando={carregando} erro={erro} temDados={dados !== null} onTentarNovamente={recarregar}>
                <ListaGastos itens={(dados ?? []).map(paraLinhaPorCategoria)} vazio="Você ainda não registrou gastos variáveis." />
            </Estado>
        </Layout>
    );
}
