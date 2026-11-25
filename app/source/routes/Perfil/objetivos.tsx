import { avisarSucesso } from '../../shared/avisoDeSucesso';
import MarcadorCor from '../../shared/marcadorCor';
import { corDaConta } from '../../styles/coresDaConta';
import { useEffect, useRef, useState, type ComponentRef } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { obterCarteira } from '../../services/carteira';
import { Ionicons } from '@expo/vector-icons';
import { confirmarDescarte, useConfirmarSaida } from '../../shared/useConfirmarSaida';
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
import { mensagemDeErroDeGravacao } from '../../services/api';
import {
    atualizarObjetivo,
    criarObjetivo,
    excluirObjetivo,
    listarObjetivos,
    type Objetivo, type ModoObjetivo,
} from '../../services/objetivos';
import { conteudoTela } from '../../shared/conteudoTela';
import { colors, ui } from '../../styles/colors';

const tiposDeObjetivo = [
    { valor: 'Investimentos', texto: 'Investimentos' },
    { valor: 'Gastos', texto: 'Gastos' },
] as const;

const statusDaMeta: Record<string, string> = { UNLINKED: 'Vincule uma posição', UNAVAILABLE: 'Inclui valores pelo custo de compra', STALE: 'Inclui valores desatualizados', ESTIMATED: 'Inclui valores estimados' };

type ItemObjetivoProps = {
    objetivo: Objetivo;
    onEditar: (objetivo: Objetivo) => void;
    onPosicionar?: (item: ComponentRef<typeof View>) => void;
};

function ItemObjetivo({ objetivo, onEditar, onPosicionar }: ItemObjetivoProps) {
    const { oculto } = usePrivacidade();
    const item = useRef<ComponentRef<typeof View>>(null);
    return (
        <TouchableOpacity
            ref={item}
            onLayout={() => { if (item.current) onPosicionar?.(item.current); }}
            style={styles.item}
            onPress={() => onEditar(objetivo)}
            accessibilityRole="button"
            accessibilityLabel={`${objetivo.valuationStatus === 'UNLINKED' ? 'Vincular posições a' : 'Editar objetivo'} ${objetivo.titulo}`}
        >
            <Text style={styles.texto}>{objetivo.titulo}</Text>
            <Text style={styles.apoio}>{objetivo.progressMode === 'PORTFOLIO' ? 'Vinculada à carteira' : 'Progresso manual'}
                {!oculto && objetivo.progresso >= 100 ? ' · Concluída' : ''}</Text>
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
    const scroll = useRef<import('react').ComponentRef<typeof ScrollView>>(null);
    const { width } = useWindowDimensions();
    const rolarAoAbrir = useRef(false);
    const lista = useRef<ComponentRef<typeof View>>(null);
    const metaParaExibir = useRef<string | null>(null);
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
    const [buscaPosicao, setBuscaPosicao] = useState('');
    const ocupado = useRef(false);
    const dadosAtuais = JSON.stringify([titulo, tipo, alvo, atual, mode, selected, prazo]);
    const inicial = useRef(dadosAtuais);
    const inicializar = useRef(false);
    useEffect(() => { if (inicializar.current) { inicial.current = dadosAtuais; inicializar.current = false; } }, [dadosAtuais]);
    const alterado = criando && !inicializar.current && dadosAtuais !== inicial.current;
    useConfirmarSaida(alterado);
    const posicoesVisiveis = (holdings.dados ?? [])
        .filter(item => (item.nome + ' ' + item.simbolo).toLowerCase().includes(buscaPosicao.trim().toLowerCase()))
        .sort((a, b) => Number(selected.includes(b.id)) - Number(selected.includes(a.id)));
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
        setBuscaPosicao('');
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

    function abrirEdicao(objetivo: Objetivo) {
        if (alterado) confirmarDescarte(() => editar(objetivo));
        else editar(objetivo);
    }

    function editar(objetivo: Objetivo) {
        rolarAoAbrir.current = true;
        inicializar.current = true;
        setBuscaPosicao('');
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
        if (!editando || ocupado.current) return;
        ocupado.current = true;
        setExcluindo(true);
        setErroForm(null);
        try {
            await excluirObjetivo(editando.id);
            avisarSucesso('Meta excluída.');
            limparFormulario();
            await recarregar();
        } catch (falha) {
            setErroForm(mensagemDeErroDeGravacao(falha));
        } finally {
            ocupado.current = false;
            setExcluindo(false);
        }
    }

    async function salvar() {
        if (ocupado.current) return;
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

        ocupado.current = true;
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
            const meta = editando
                ? await atualizarObjetivo(editando.id, dadosDoObjetivo, {
                    alvo: alvo === decimalParaCampo(editando.valorAlvoExato),
                    atual: editando.progressMode === 'MANUAL' && atual === decimalParaCampo(editando.valorAtualExato),
                })
                : await criarObjetivo(dadosDoObjetivo);
            metaParaExibir.current = meta.id;
            avisarSucesso('Meta salva.');
            limparFormulario();
            await recarregar();
        } catch (falha) {
            setErroForm(mensagemDeErroDeGravacao(falha));
        } finally {
            ocupado.current = false;
            setSalvando(false);
        }
    }

    function Secao({ rotulo, itens }: { rotulo: string; itens: Objetivo[] }) {
        if (itens.length === 0) return null;
        return (
            <Card rotulo={rotulo}>
                {itens.map((objetivo) => (
                    <ItemObjetivo key={objetivo.id} objetivo={objetivo} onEditar={abrirEdicao} onPosicionar={(item) => {
                        if (metaParaExibir.current !== objetivo.id || !lista.current) return;
                        item.measureLayout(lista.current, (_x, y) => {
                            metaParaExibir.current = null;
                            scroll.current?.scrollTo({ y, animated: false });
                        }, () => {});
                    }} />
                ))}
            </Card>
        );
    }

    return (
        <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
            <View style={[conteudoTela(width, criando ? ui.width.form : ui.width.reading), styles.topo]}>
                <TouchableOpacity
                    style={styles.botaoFechar}
                    onPress={() => criando ? (alterado ? confirmarDescarte(limparFormulario) : limparFormulario()) : navigation.goBack()}
                    accessibilityRole="button"
                    accessibilityLabel={criando ? "Cancelar edição" : "Fechar"}
                >
                    <Ionicons name="close" size={20} color={colors.text} />
                </TouchableOpacity>
                <Text accessibilityRole="header" style={styles.titulo}>{criando ? (editando ? "Editar objetivo" : "Nova meta") : "Objetivos"}</Text>
                <View style={styles.espacoTopo} />
            </View>

            <ScrollView ref={scroll} contentContainerStyle={[conteudoTela(width, criando ? ui.width.form : ui.width.reading), styles.conteudo]}
                keyboardShouldPersistTaps="handled" automaticallyAdjustKeyboardInsets>
                {!criando && <View style={styles.formulario} ref={lista} collapsable={false}>
                    <BotaoPrimario titulo="Nova meta" onPress={() => { inicial.current = dadosAtuais; rolarAoAbrir.current = true; setCriando(true); }} />
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
                </View>}

                {criando ? (
                    <Card>
                        <View style={styles.formulario} onLayout={() => {
                            if (rolarAoAbrir.current) {
                                rolarAoAbrir.current = false;
                                scroll.current?.scrollTo({ y: 0, animated: false });
                            }
                        }}>
                            <Opcoes rotulo="Tipo" opcoes={opcoesDeTipo} selecionado={tipo} onSelecionar={setTipo} />
                            <Field label="Nome" placeholder="Ex.: Reserva de emergência" value={titulo} onChangeText={setTitulo} />
                            <Field financeiro label="Valor alvo (R$)" placeholder="0,00" keyboardType="decimal-pad" value={alvo} onChangeText={setAlvo} />
                            {tipo === 'Investimentos' && <Opcoes rotulo="Progresso" opcoes={[{ valor: 'MANUAL', texto: 'Manual' }, { valor: 'PORTFOLIO', texto: 'Vincular posições' }]} selecionado={mode} onSelecionar={setMode} />}
                            {tipo === 'Investimentos' && <Text style={styles.apoio}>{linking ? 'O progresso acompanha o valor das posições selecionadas.' : 'No modo manual, atualize o valor acumulado quando quiser.'}</Text>}
                            {!linking ? <Field financeiro label="Valor atual informado manualmente (R$)" placeholder="0,00" keyboardType="decimal-pad" value={atual} onChangeText={setAtual} /> :
                                <Estado carregando={holdings.carregando} erro={holdings.erro} temDados={Boolean(holdings.dados?.length)}
                                    onTentarNovamente={holdings.recarregar}>
                                    <Field label="Buscar posições" value={buscaPosicao} onChangeText={setBuscaPosicao} />
                                    <Text accessibilityLiveRegion="polite" style={styles.apoio}>{selected.length} posições selecionadas</Text>
                                    {posicoesVisiveis.length ? posicoesVisiveis.map(holding => {
                                        const checked = selected.includes(holding.id);
                                        return <TouchableOpacity key={holding.id} accessibilityRole="checkbox" accessibilityState={{ checked }}
                                            style={styles.posicao} onPress={() => setSelected(ids => checked ? ids.filter(id => id !== holding.id) : [...ids, holding.id])}>
                                            <Ionicons name={checked ? 'checkbox' : 'square-outline'} color={colors.primary} size={20} />
                                            <MarcadorCor cor={corDaConta(holding.id)} />
                                            <View style={styles.posicaoDados}>
                                                <Text style={styles.texto}>{holding.nome}</Text>
                                                <Text style={styles.apoio}>{holding.investmentType === 'FIXED_INCOME' ? 'Renda fixa' : 'Renda variável'}
                                                    {oculto ? '' : ' · ' + formatarReais(holding.valorAtual)}</Text>
                                            </View>
                                        </TouchableOpacity>;
                                    }) : <Text style={styles.apoio}>{holdings.dados?.length ? 'Nenhuma posição encontrada.' : 'Adicione uma posição na carteira para vinculá-la.'}</Text>}
                                </Estado>}
                            <CampoData
                                label="Prazo (opcional)"
                                value={prazo}
                                onChange={setPrazo}
                                opcional
                            />
                            {erroForm ? <Text accessibilityLiveRegion="polite" style={styles.erro}>{erroForm}</Text> : null}
                            <BotaoPrimario
                                titulo={editando ? 'Salvar alterações' : 'Salvar objetivo'}
                                onPress={salvar}
                                carregando={salvando}
                                desabilitado={excluindo}
                            />
                            {editando ? (
                                <BotaoExcluir rotulo="Excluir objetivo" detalhe={`Excluir a meta ${editando.titulo}? As posições da carteira permanecem.`} onConfirmar={excluir} carregando={excluindo} />
                            ) : null}
                            <TouchableOpacity style={styles.cancelar} accessibilityRole="button" onPress={() => alterado ? confirmarDescarte(limparFormulario) : limparFormulario()}>
                                <Text style={styles.apoio}>Cancelar</Text>
                            </TouchableOpacity>
                        </View>
                    </Card>
                ) : null}
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
        paddingVertical: 16,
    },
    titulo: {
        flex: 1,
        textAlign: 'center',
        fontSize: ui.font.sectionTitle,
        fontWeight: 'bold',
        color: colors.text,
    },
    botaoFechar: {
        width: ui.touch,
        minHeight: ui.touch,
        borderRadius: 22,
        backgroundColor: colors.surface,
        alignItems: 'center',
        justifyContent: 'center',
    },
    espacoTopo: { width: ui.touch },
    conteudo: {
        paddingBottom: ui.space.xxl,
        gap: ui.space.lg,
    },
    formulario: { gap: ui.space.lg },
    posicaoDados: { flex: 1, minWidth: 0 },
    item: {
        minHeight: ui.touch,
        paddingVertical: ui.space.sm,
    },
    trilho: {
        height: 6,
        borderRadius: 3,
        backgroundColor: colors.border,
        overflow: 'hidden',
        marginTop: 8,
    },
    posicao: { flexDirection: 'row', alignItems: 'center', gap: 8, minHeight: 48 },
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
        fontSize: ui.font.label,
        color: colors.textMuted,
        marginTop: 4,
    },
});
