import { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
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
    type Objetivo,
} from '../../services/objetivos';
import { colors } from '../../styles/colors';

const tiposDeObjetivo = [
    { valor: 'Investimentos', texto: 'Investimentos' },
    { valor: 'Gastos', texto: 'Gastos' },
] as const;

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
                <View style={[styles.preenchimento, { width: `${objetivo.progresso}%` }]} />
            </View>}
            <Text style={styles.apoio}>
                {oculto ? 'Valores ocultos' : `${formatarReais(objetivo.valorAtual)} / ${formatarReais(objetivo.valorAlvo)} (${Math.round(objetivo.progresso)}%)`}
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
        setAtual(decimalParaCampo(objetivo.valorAtualExato));
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
        const valorAtual = atual.trim() ? lerDecimal(atual, 17, 2) : '0';
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
                prazo: prazoIso,
            };
            if (editando) await atualizarObjetivo(editando.id, dadosDoObjetivo, {
                alvo: alvo === decimalParaCampo(editando.valorAlvoExato),
                atual: atual === decimalParaCampo(editando.valorAtualExato),
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
                        <Field financeiro label="Valor atual informado manualmente (R$)" placeholder="0,00" keyboardType="decimal-pad" value={atual} onChangeText={setAtual} />
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
    preenchimento: {
        height: 6,
        borderRadius: 3,
        backgroundColor: colors.primary,
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
