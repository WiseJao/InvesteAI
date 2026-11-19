import Layout from '../../shared/layout';
import ListaGastos from './components/listaGastos';
import { gastosVariaveis } from './dados';

export default function GastosVariaveis() {
    return (
        <Layout titulo="Gastos variáveis" subtitulo="Gastos do mês, fora o fixo" voltar>
            <ListaGastos itens={gastosVariaveis} />
        </Layout>
    );
}
