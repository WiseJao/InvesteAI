import Layout from '../../shared/layout';
import ListaGastos from './components/listaGastos';
import { gastosFixos } from './dados';

export default function GastosFixos() {
    return (
        <Layout titulo="Gastos fixos" subtitulo="Recorrentes todo mês" voltar>
            <ListaGastos itens={gastosFixos} />
        </Layout>
    );
}
