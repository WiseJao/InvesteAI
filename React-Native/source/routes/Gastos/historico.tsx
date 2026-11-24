import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Layout from '../../shared/layout';
import Estado from '../../shared/estado';
import { useCarregar } from '../../shared/useCarregar';
import { listarMovimentacoes } from '../../services/gastos';
import type { GastosStackParamList } from './types';
import ListaGastos from './components/listaGastos';
import { paraLinhaDeHistorico } from './dados';

export default function HistoricoGastos() {
    const navigation = useNavigation<NativeStackNavigationProp<GastosStackParamList>>();
    const { dados, carregando, erro, recarregar } = useCarregar(() => listarMovimentacoes());

    return (
        <Layout titulo="Histórico de gastos" subtitulo="Fixos e variáveis combinados" voltar>
            <Estado carregando={carregando} erro={erro} temDados={dados !== null} onTentarNovamente={recarregar}>
                <ListaGastos
                    onSelecionar={(id) => {
                        const gasto = (dados ?? []).find((item) => item.id === id);
                        if (gasto) navigation.navigate('NovoGasto', { gasto });
                    }}
                    itens={(dados ?? []).map(paraLinhaDeHistorico)} vazio="Seu histórico está vazio." />
            </Estado>
        </Layout>
    );
}
