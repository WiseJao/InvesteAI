import MarcadorCor from '../../shared/marcadorCor';
import { corDaConta } from '../../styles/coresDaConta';
import { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { obterCarteira } from '../../services/carteira';
import { Ionicons } from '@expo/vector-icons';
import Card from '../../shared/card';
import Estado from '../../shared/estado';
import Field from '../../shared/field';
import CampoData from '../../shared/campoData';
import Opcoes from '../../shared/opcoes';
import BotaoPrimario from '../../shared/botaoPrimario';
import BotaoExcluir from '../../shared/botaoExcluir';
import { decimalParaCampo, formatarReais, lerDecimal } from '../../shared/currency';
import { usePrivacidade } from '../../shared/privacidade';
import { brParaIso, isoParaBr } from '../../shared/datas';
import { useCarregar } from '../../shared/useCarregar';
import { mensagemDeErro } from '../../services/api';
import {
    atualizarObjetivo,
    criarObjetivo,
    excluirObjetivo,
    listarObjetivos,
    type Objetivo, type ModoObjetivo,
} from '../../services/objetivos';
import { colors } from '../../styles/colors';

const tiposDeObjetivo = [
    { valor: 'Investimentos', texto: 'Investimentos' },
    { valor: 'Gastos', texto: 'Gastos' },
] as const;

const statusDaMeta: Record<string, string> = { UNLINKED: 'Vincule uma posição', UNAVAILABLE: 'Inclui valores pelo custo de compra', STALE: 'Inclui valores desatualizados', ESTIMATED: 'Inclui valores estimados' };

function ItemObjetivo({ objetivo, onEditar }: { objetivo: Objetivo; onEditar: (objetivo: Objetivo) => void }) {
    const { oculto } = usePrivacidade();
    return (
        <TouchableOpacity
            style={styles.item}
            onPress={() => onEditar(objetivo)}
            accessibilityRole="button"
            accessibilityLabel={`Editar objetivo ${objetivo.titulo}`}
        >
            <Text style={styles.texto}>{objetivo.titulo}</Text>
            {!oculto && <View style={styles.trilho}>
                <LinearGradient colors={['#16804c', '#56e495']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={[styles.preenchimento, { width: `${objetivo.progresso}%` }]} />
            </View>}
            <Text style={styles.apoio}>
                {oculto ? 'Valores ocultos' : `${formatarReais(objetivo.valorAtual)} / ${formatarReais(objetivo.valorAlvo)} (${Math.round(objetivo.progresso)}%)`}
                {!oculto && objetivo.valuationStatus && statusDaMeta[objetivo.valuationStatus] ? ' · ' + statusDaMeta[objetivo.valuationStatus] : ''}
                {objetivo.prazo ? ` · até ${isoParaBr(objetivo.prazo)}` : ''}
            </Text>
        </TouchableOpacity>
    );
}

export default function Objetivos() {
    const navigation = useNavigation();
    const { dados, carregando, erro, recarregar } = useCarregar(listarObjetivos);
    const [criando, setCriando] = useState(false);
    const [editando, setEditando] = useState<Objetivo | null>(null);
    const [excluindo, setExcluindo] = useState(false);
    const [titulo, setTitulo] = useState('');
    const [tipo, setTipo] = useState<string>('Investimentos');
    const [alvo, setAlvo] = useState('');
    const [atual, setAtual] = useState('');
    const [mode, setMode] = useState<ModoObjetivo>('MANUAL');
    const [selected, setSelected] = useState<string[]>([]);
    const linking = criando && tipo === 'Investimentos' && mode === 'PORTFOLIO';
    const holdings = useCarregar(async () => linking ? (await obterCarteira()).ativos : [], [linking]);
    const { oculto } = usePrivacidade();
    const [prazo, setPrazo] = useState('');
    const [salvando, setSalvando] = useState(false);
    const [erroForm, setErroForm] = useState<string | null>(null);

    const objetivos = dados ?? [];
    const deInvestimento = objetivos.filter((objetivo) => objetivo.categoria === 'Investimentos');
    const deGastos = objetivos.filter((objetivo) => objetivo.categoria === 'Gastos');
    const outros = objetivos.filter(
        (objetivo) => objetivo.categoria !== 'Investimentos' && objetivo.categoria !== 'Gastos',
    );

    const opcoesDeTipo = tiposDeObjetivo.some((opcao) => opcao.valor === tipo)
        ? tiposDeObjetivo
        : [...tiposDeObjetivo, { valor: tipo, texto: tipo || 'Sem categoria' }];

    function limparFormulario() {
        setTitulo('');
        setTipo('Investimentos');
        setAlvo('');
        setAtual('');
        setMode('MANUAL');
        setSelected([]);
        setPrazo('');
        setErroForm(null);
        setEditando(null);
        setCriando(false);
    }

    function editar(objetivo: Objetivo) {
        setEditando(objetivo);
        setTitulo(objetivo.titulo);
        setTipo(objetivo.categoria);
        setAlvo(decimalParaCampo(objetivo.valorAlvoExato));
        setAtual(objetivo.progressMode === 'MANUAL' ? decimalParaCampo(objetivo.valorAtualExato) : '');
        setMode(objetivo.progressMode);
        setSelected(objetivo.holdingIds);
        setPrazo(objetivo.prazo ? isoParaBr(objetivo.prazo) : '');
        setErroForm(null);
        setCriando(true);
    }

    async function excluir() {
        if (!editando) return;
        setExcluindo(true);
        setErroForm(null);
        try {
            await excluirObjetivo(editando.id);
            limparFormulario();
            await recarregar();
        } catch (falha) {
            setErroForm(mensagemDeErro(falha));
        } finally {
            setExcluindo(false);
        }
    }

    async function salvar() {
        const valorAlvo = lerDecimal(alvo, 17, 2);
        const progressMode = linking ? 'PORTFOLIO' as const : 'MANUAL' as const;
        if (linking && !selected.length && editando?.valuationStatus !== 'UNLINKED') return setErroForm('Selecione pelo menos uma posição.');
        const valorAtual = !linking && atual.trim() ? lerDecimal(atual, 17, 2) : '0';
        const prazoIso = prazo.trim() ? brParaIso(prazo) : null;

        if (!titulo.trim()) return setErroForm('Dê um nome ao objetivo.');
        if (Array.from(titulo.trim()).length > 255) return setErroForm('O nome deve ter até 255 caracteres.');
        if (valorAlvo === null || Number(valorAlvo) <= 0) return setErroForm('Informe um valor alvo positivo com até 17 dígitos inteiros e 2 casas decimais.');
        if (valorAtual === null) return setErroForm('Informe um valor atual não negativo com até 17 dígitos inteiros e 2 casas decimais.');
        if (prazo.trim() && !prazoIso) return setErroForm('Informe um prazo válido (DD/MM/AAAA).');

        setSalvando(true);
        setErroForm(null);
        try {
            const dadosDoObjetivo = {
                titulo: titulo.trim(),
                categoria: tipo,
                valorAlvo,
                valorAtual,
                progressMode,
                holdingIds: linking ? selected.length ? selected : undefined : [],
                prazo: prazoIso,
            };
            if (editando) await atualizarObjetivo(editando.id, dadosDoObjetivo, {
                alvo: alvo === decimalParaCampo(editando.valorAlvoExato),
                atual: editando.progressMode === 'MANUAL' && atual === decimalParaCampo(editando.valorAtualExato),
            });
            else await criarObjetivo(dadosDoObjetivo);
            limparFormulario();
            await recarregar();
        } catch (falha) {
            setErroForm(mensagemDeErro(falha));
        } finally {
            setSalvando(false);
        }
    }

    function Secao({ rotulo, itens }: { rotulo: string; itens: Objetivo[] }) {
        if (itens.length === 0) return null;
        return (
            <Card rotulo={rotulo}>
                {itens.map((objetivo) => (
                    <ItemObjetivo key={objetivo.id} objetivo={objetivo} onEditar={editar} />
                ))}
            </Card>
        );
    }

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.topo}>
                <TouchableOpacity
                    style={styles.botaoFechar}
                    onPress={() => navigation.goBack()}
                    accessibilityRole="button"
                    accessibilityLabel="Fechar"
                >
                    <Ionicons name="close" size={20} color={colors.text} />
                </TouchableOpacity>
                <Text style={styles.titulo}>Objetivos</Text>
                <View style={styles.espacoTopo} />
            </View>

            <ScrollView contentContainerStyle={styles.conteudo} keyboardShouldPersistTaps="handled">
                <Estado carregando={carregando} erro={erro} temDados={dados !== null} onTentarNovamente={recarregar}>
                    {objetivos.length === 0 ? (
                        <Card>
                            <Text style={styles.apoio}>Você ainda não criou nenhum objetivo.</Text>
                        </Card>
                    ) : null}
                    <Secao rotulo="INVESTIMENTOS" itens={deInvestimento} />
                    <Secao rotulo="GASTOS" itens={deGastos} />
                    <Secao rotulo="OUTROS" itens={outros} />
                </Estado>

                {criando ? (
                    <Card rotulo={editando ? 'EDITAR OBJETIVO' : 'NOVO OBJETIVO'}>
                        <Opcoes rotulo="Tipo" opcoes={opcoesDeTipo} selecionado={tipo} onSelecionar={setTipo} />
                        <Field label="Nome" placeholder="Ex.: Reserva de emergência" value={titulo} onChangeText={setTitulo} />
                        <Field financeiro label="Valor alvo (R$)" placeholder="0,00" keyboardType="decimal-pad" value={alvo} onChangeText={setAlvo} />
                        {tipo === 'Investimentos' && <Opcoes rotulo="Progresso" opcoes={[{ valor: 'MANUAL', texto: 'Manual' }, { valor: 'PORTFOLIO', texto: 'Vincular posições' }]} selecionado={mode} onSelecionar={setMode} />}
                        {!linking ? <Field financeiro label="Valor atual informado manualmente (R$)" placeholder="0,00" keyboardType="decimal-pad" value={atual} onChangeText={setAtual} /> :
                            <Estado carregando={holdings.carregando} erro={holdings.erro} temDados={Boolean(holdings.dados?.length)}
                                onTentarNovamente={holdings.recarregar}>
                                {holdings.dados?.length ? holdings.dados.map(holding => {
                                    const checked = selected.includes(holding.id);
                                    return <TouchableOpacity key={holding.id} accessibilityRole="checkbox" accessibilityState={{ checked }}
                                        style={styles.posicao} onPress={() => setSelected(ids => checked ? ids.filter(id => id !== holding.id) : [...ids, holding.id])}>
                                        <Ionicons name={checked ? 'checkbox' : 'square-outline'} color={colors.primary} size={20} />
                                        <MarcadorCor cor={corDaConta(holding.id)} />
                                        <Text style={styles.texto}>{holding.nome}{oculto ? '' : ' · ' + formatarReais(holding.valorAtual)}</Text>
                                    </TouchableOpacity>;
                                }) : <Text style={styles.apoio}>Adicione uma posição na carteira para vinculá-la.</Text>}
                            </Estado>}
                        <CampoData
                            label="Prazo (opcional)"
                            value={prazo}
                            onChange={setPrazo}
                            opcional
                        />
                        {erroForm ? <Text style={styles.erro}>{erroForm}</Text> : null}
                        <BotaoPrimario
                            titulo={editando ? 'Salvar alterações' : 'Salvar objetivo'}
                            onPress={salvar}
                            carregando={salvando}
                            desabilitado={excluindo}
                        />
                        {editando ? (
                            <BotaoExcluir rotulo="Excluir objetivo" onConfirmar={excluir} carregando={excluindo} />
                        ) : null}
                        <TouchableOpacity style={styles.cancelar} onPress={limparFormulario}>
                            <Text style={styles.apoio}>Cancelar</Text>
                        </TouchableOpacity>
                    </Card>
                ) : (
                    <BotaoPrimario titulo="Novo objetivo" onPress={() => setCriando(true)} />
                )}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    topo: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 16,
    },
    titulo: {
        fontSize: 16,
        fontWeight: 'bold',
        color: colors.text,
    },
    botaoFechar: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: colors.surface,
        alignItems: 'center',
        justifyContent: 'center',
    },
    espacoTopo: { width: 44 },
    conteudo: {
        paddingHorizontal: 20,
        paddingBottom: 40,
    },
    item: {
        marginBottom: 12,
    },
    trilho: {
        height: 6,
        borderRadius: 3,
        backgroundColor: colors.border,
        overflow: 'hidden',
        marginTop: 8,
    },
    posicao: { flexDirection: 'row', alignItems: 'center', gap: 8, minHeight: 44 },
    preenchimento: {
        height: 6,
        borderRadius: 3,
    },
    cancelar: {
        alignItems: 'center',
        padding: 12,
    },
    erro: {
        color: colors.negative,
        fontSize: 12,
        marginBottom: 8,
    },
    texto: {
        fontSize: 14,
        color: colors.text,
    },
    apoio: {
        fontSize: 11,
        color: colors.textMuted,
        marginTop: 4,
    },
});
