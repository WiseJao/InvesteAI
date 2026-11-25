import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Layout from '../../shared/layout';
import Estado from '../../shared/estado';
import { useCarregar } from '../../shared/useCarregar';
import { listarMovimentacoes } from '../../services/gastos';
import type { GastosStackParamList } from './types';
import ListaGastos from './components/listaGastos';
import { paraLinhaPorCategoria } from './dados';

export default function GastosFixos() {
    const navigation = useNavigation<NativeStackNavigationProp<GastosStackParamList>>();
    const { dados, carregando, erro, recarregar } = useCarregar(async () => {
        const agora = new Date();
        const mes = `${agora.getFullYear()}-${String(agora.getMonth() + 1).padStart(2, '0')}`;
        return (await listarMovimentacoes('EXPENSE_FIXED')).filter((item) => item.data.startsWith(`${mes}-`));
    });

    return (
        <Layout titulo="Gastos fixos" subtitulo="Recorrentes todo mês" voltar>
            <Estado carregando={carregando} erro={erro} temDados={dados !== null} onTentarNovamente={recarregar}>
                <ListaGastos
                    onSelecionar={(id) => {
                        const gasto = (dados ?? []).find((item) => item.id === id);
                        if (gasto) navigation.navigate('NovoGasto', { gasto });
                    }}
                    itens={(dados ?? []).map(paraLinhaPorCategoria)} vazio="Você ainda não registrou gastos fixos." />
            </Estado>
        </Layout>
    );
}
