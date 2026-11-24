import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Layout from '../../shared/layout';
import Estado from '../../shared/estado';
import { useCarregar } from '../../shared/useCarregar';
import { listarMovimentacoes } from '../../services/gastos';
import type { GastosStackParamList } from './types';
import ListaGastos from './components/listaGastos';
import { paraLinhaPorCategoria } from './dados';

export default function GastosVariaveis() {
    const navigation = useNavigation<NativeStackNavigationProp<GastosStackParamList>>();
    const { dados, carregando, erro, recarregar } = useCarregar(() => listarMovimentacoes('EXPENSE_VARIABLE'));

    return (
        <Layout titulo="Gastos variáveis" subtitulo="Gastos do mês, fora o fixo" voltar>
            <Estado carregando={carregando} erro={erro} temDados={dados !== null} onTentarNovamente={recarregar}>
                <ListaGastos
                    onSelecionar={(id) => {
                        const gasto = (dados ?? []).find((item) => item.id === id);
                        if (gasto) navigation.navigate('NovoGasto', { gasto });
                    }}
                    itens={(dados ?? []).map(paraLinhaPorCategoria)} vazio="Você ainda não registrou gastos variáveis." />
            </Estado>
        </Layout>
    );
}
