import Layout from '../../shared/layout';
import ListaGastos from './components/listaGastos';
import { historicoGastos } from './dados';

export default function HistoricoGastos() {
    return (
        <Layout titulo="Histórico de gastos" subtitulo="Fixos e variáveis combinados" voltar>
            <ListaGastos itens={historicoGastos} />
        </Layout>
    );
}
