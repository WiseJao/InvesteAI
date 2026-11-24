import Layout from '../../shared/layout';
import Estado from '../../shared/estado';
import { useCarregar } from '../../shared/useCarregar';
import { listarMovimentacoes } from '../../services/gastos';
import ListaGastos from './components/listaGastos';
import { paraLinhaPorCategoria } from './dados';

export default function GastosFixos() {
    const { dados, carregando, erro, recarregar } = useCarregar(() => listarMovimentacoes('EXPENSE_FIXED'));

    return (
        <Layout titulo="Gastos fixos" subtitulo="Recorrentes todo mês" voltar>
            <Estado carregando={carregando} erro={erro} temDados={dados !== null} onTentarNovamente={recarregar}>
                <ListaGastos itens={(dados ?? []).map(paraLinhaPorCategoria)} vazio="Você ainda não registrou gastos fixos." />
            </Estado>
        </Layout>
    );
}
