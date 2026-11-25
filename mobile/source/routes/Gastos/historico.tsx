import { useEffect, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Layout from '../../shared/layout';
import Estado from '../../shared/estado';
import Field from '../../shared/field';
import Opcoes from '../../shared/opcoes';
import { useCarregar } from '../../shared/useCarregar';
import { usePrivacidade } from '../../shared/privacidade';
import { formatarReais } from '../../shared/currency';
import { listarMovimentacoes, tipoDaMovimentacao } from '../../services/gastos';
import { colors } from '../../styles/colors';
import type { GastosStackParamList } from './types';
import ListaGastos from './components/listaGastos';
import { paraLinhaDeHistorico } from './dados';

const tipos = [
    { valor: 'TODOS', texto: 'Todos' }, { valor: 'EXPENSE_FIXED', texto: 'Fixos' },
    { valor: 'EXPENSE_VARIABLE', texto: 'Variáveis' }, { valor: 'INCOME', texto: 'Receitas' },
] as const;

function normalizar(texto: string) {
    return texto.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

function rotuloMes(mes: string) {
    const [ano, numero] = mes.split('-').map(Number);
    return new Date(ano, numero - 1, 1).toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' });
}

export default function HistoricoGastos() {
    const navigation = useNavigation<NativeStackNavigationProp<GastosStackParamList>>();
    const route = useRoute<RouteProp<GastosStackParamList, 'HistoricoGastos'>>();
    const periodo = route.params?.periodo;
    const [mes, setMes] = useState(periodo ?? '');
    const [tipo, setTipo] = useState<(typeof tipos)[number]['valor']>('TODOS');
    const [busca, setBusca] = useState('');
    const { oculto } = usePrivacidade();
    const { dados, carregando, erro, recarregar } = useCarregar(() => listarMovimentacoes());

    useEffect(() => { if (periodo) setMes(periodo); }, [periodo, route.params?.consulta]);
    const meses = [...new Set([...(dados ?? []).map(item => item.data.slice(0, 7)), ...(mes ? [mes] : [])])].sort().reverse();
    const termo = normalizar(busca);
    const itens = (dados ?? []).filter(item =>
        (!mes || item.data.startsWith(mes + '-')) &&
        (tipo === 'TODOS' || tipoDaMovimentacao(item) === tipo) &&
        normalizar(item.nome + ' ' + item.categoria).includes(termo));
    const entradas = itens.filter(item => item.entrada).reduce((soma, item) => soma + item.valor, 0);
    const despesas = itens.filter(item => !item.entrada).reduce((soma, item) => soma + item.valor, 0);
    const filtrado = Boolean(termo || mes || tipo !== 'TODOS');

    return (
        <Layout titulo="Lançamentos" voltar>
            <Estado carregando={carregando} erro={erro} temDados={dados !== null} onTentarNovamente={recarregar}>
                <Opcoes rotulo="Período" opcoes={[{ valor: '', texto: 'Todos os meses' }, ...meses.map(valor => ({ valor, texto: rotuloMes(valor) }))]} selecionado={mes} onSelecionar={setMes} />
                <Opcoes rotulo="Tipo" opcoes={tipos} selecionado={tipo} onSelecionar={setTipo} />
                <Field label="Buscar por descrição ou categoria" value={busca} onChangeText={setBusca} returnKeyType="search" />
                {filtrado && <Pressable accessibilityRole="button" style={{ minHeight: 48, justifyContent: 'center', alignSelf: 'flex-start' }} onPress={() => { setMes(''); setTipo('TODOS'); setBusca(''); }}>
                    <Text style={{ color: colors.primary }}>Limpar filtros</Text>
                </Pressable>}
                <View style={{ gap: 4 }}>
                    <Text accessibilityLiveRegion="polite" style={{ color: colors.text }}>{itens.length} lançamentos</Text>
                    <Text style={{ color: colors.textMuted }}>{oculto ? 'Valores ocultos' : 'Receitas ' + formatarReais(entradas) + ' · Despesas ' + formatarReais(despesas)}</Text>
                </View>
                <ListaGastos onSelecionar={id => {
                    const gasto = itens.find(item => item.id === id);
                    if (gasto) navigation.navigate('NovoGasto', { gasto });
                }} itens={itens.map(paraLinhaDeHistorico)} vazio={(termo || tipo !== 'TODOS') ? 'Nenhum lançamento corresponde aos filtros.' : mes ? 'Nenhum lançamento neste mês.' : 'Seu histórico está vazio.'} />
            </Estado>
        </Layout>
    );
}
