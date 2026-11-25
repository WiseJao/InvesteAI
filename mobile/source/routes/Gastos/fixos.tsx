import MarcadorCor from '../../shared/marcadorCor';
import { corDaConta } from '../../styles/coresDaConta';
import { Text, Pressable, View } from 'react-native';
import BotaoPrimario from '../../shared/botaoPrimario';
import { colors } from '../../styles/colors';
import { formatarReais } from '../../shared/currency';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { usePrivacidade } from '../../shared/privacidade';
import Layout from '../../shared/layout';
import Estado from '../../shared/estado';
import { useCarregar } from '../../shared/useCarregar';
import { listarMovimentacoes, listarRecorrencias } from '../../services/gastos';
import type { GastosStackParamList } from './types';
import ListaGastos from './components/listaGastos';
import { paraLinhaPorCategoria } from './dados';

export default function GastosFixos() {
    const { oculto } = usePrivacidade();
    const navigation = useNavigation<NativeStackNavigationProp<GastosStackParamList>>();
    const { dados, carregando, erro, recarregar } = useCarregar(async () => {
        const agora = new Date();
        const mes = `${agora.getFullYear()}-${String(agora.getMonth() + 1).padStart(2, '0')}`;
        const gastos = (await listarMovimentacoes('EXPENSE_FIXED')).filter(item => item.data.startsWith(mes + '-'));
        return { gastos, regras: await listarRecorrencias() };
    });

    return (
        <Layout titulo="Gastos fixos" subtitulo="Recorrências e lançamentos do mês" voltar>
            <Estado carregando={carregando} erro={erro} temDados={dados !== null} onTentarNovamente={recarregar}>
                <BotaoPrimario titulo="Novo gasto fixo" onPress={() => navigation.navigate('NovoGasto', { novoFixo: true })} />
                {dados?.regras.map(regra => <Pressable key={regra.id} accessibilityRole="button" disabled={regra.ended} onPress={() => navigation.navigate('NovoGasto', { regra })} style={{ minHeight: 48, justifyContent: 'center' }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                        <MarcadorCor cor={corDaConta(regra.id)} />
                        <Text style={{ color: colors.text, flex: 1 }}>{regra.description}</Text>
                        {!oculto && <Text style={{ color: colors.text }}>{formatarReais(Number(regra.amount))}</Text>}
                    </View>
                    <Text style={{ color: colors.textMuted, marginLeft: 16 }}>{regra.ended ? 'Encerrada' : 'Mensal'}</Text>
                </Pressable>)}
                <ListaGastos
                    onSelecionar={(id) => {
                        const gasto = (dados?.gastos ?? []).find((item) => item.id === id);
                        if (gasto) navigation.navigate('NovoGasto', { gasto });
                    }}
                    itens={(dados?.gastos ?? []).map(paraLinhaPorCategoria)} vazio="Você ainda não registrou gastos fixos." />
            </Estado>
        </Layout>
    );
}
