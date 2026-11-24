import Layout from '../../shared/layout';
import Estado from '../../shared/estado';
import { useCarregar } from '../../shared/useCarregar';
import { listarMovimentacoes } from '../../services/gastos';
import ListaGastos from './components/listaGastos';
import { paraLinhaDeHistorico } from './dados';

export default function HistoricoGastos() {
    const { dados, carregando, erro, recarregar } = useCarregar(() => listarMovimentacoes());

    return (
        <Layout titulo="Histórico de gastos" subtitulo="Fixos e variáveis combinados" voltar>
            <Estado carregando={carregando} erro={erro} temDados={dados !== null} onTentarNovamente={recarregar}>
                <ListaGastos itens={(dados ?? []).map(paraLinhaDeHistorico)} vazio="Seu histórico está vazio." />
            </Estado>
        </Layout>
    );
}
