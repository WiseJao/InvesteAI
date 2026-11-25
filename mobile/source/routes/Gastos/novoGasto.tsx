import { avisarSucesso } from '../../shared/avisoDeSucesso';
import { useEffect, useRef, useState } from 'react';
import { Text, TextInput, StyleSheet } from 'react-native';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import { useConfirmarSaida } from '../../shared/useConfirmarSaida';
import Layout from '../../shared/layout';
import Field from '../../shared/field';
import CampoData from '../../shared/campoData';
import Opcoes from '../../shared/opcoes';
import BotaoPrimario from '../../shared/botaoPrimario';
import BotaoExcluir from '../../shared/botaoExcluir';
import { decimalParaCampo, lerDecimal } from '../../shared/currency';
import { brParaIso, isoParaBr, hojeIso } from '../../shared/datas';
import { mensagemDeErroDeGravacao } from '../../services/api';
import {
    atualizarMovimentacao,
    encerrarRecorrencia, salvarRecorrencia,
    criarMovimentacao,
    excluirMovimentacao,
    tipoDaMovimentacao,
    type TipoMovimentacao,
} from '../../services/gastos';
import { colors } from '../../styles/colors';
import { categoriasDeGasto } from './dados';
import type { GastosStackParamList } from './types';

const categoriasDeReceita = ['Renda', 'Salário'];

const tipos: readonly { valor: TipoMovimentacao; texto: string }[] = [
    { valor: 'EXPENSE_VARIABLE', texto: 'Gasto variável' },
    { valor: 'EXPENSE_FIXED', texto: 'Gasto fixo' },
    { valor: 'INCOME', texto: 'Receita' },
];


export default function NovoGasto() {
    const navigation = useNavigation();
    const route = useRoute<RouteProp<GastosStackParamList, 'NovoGasto'>>();
    const gastoEditado = route.params?.gasto;
    const regra = route.params?.regra;
    const editando = gastoEditado !== undefined || regra !== undefined;

    const [tipo, setTipo] = useState<TipoMovimentacao>(gastoEditado ? tipoDaMovimentacao(gastoEditado) : regra || route.params?.novoFixo ? 'EXPENSE_FIXED' : 'EXPENSE_VARIABLE');
    const [nome, setNome] = useState(regra?.description ?? gastoEditado?.nome ?? '');
    const [valor, setValor] = useState(regra ? decimalParaCampo(regra.amount) : gastoEditado ? decimalParaCampo(gastoEditado.valorExato) : '');
    const [categoria, setCategoria] = useState<string>(
        regra?.category ?? (gastoEditado && !gastoEditado.entrada ? gastoEditado.categoria : categoriasDeGasto[0]),
    );
    const [categoriaReceita, setCategoriaReceita] = useState(gastoEditado?.entrada ? gastoEditado.categoria : 'Renda');
    const [data, setData] = useState(isoParaBr(regra?.firstDate ?? gastoEditado?.data ?? hojeIso()));
    const [repetir, setRepetir] = useState(regra ? 'mensal' : 'avulso');
    const [fim, setFim] = useState(regra?.lastDate ? isoParaBr(regra.lastDate) : '');
    const [salvando, setSalvando] = useState(false);
    const [excluindo, setExcluindo] = useState(false);
    const [concluido, setConcluido] = useState(false);
    const [erroCampo, setErroCampo] = useState<{ descricao?: string; valor?: string }>({});
    const descricaoRef = useRef<import('react').ComponentRef<typeof TextInput>>(null);
    const valorRef = useRef<import('react').ComponentRef<typeof TextInput>>(null);
    const ocupada = useRef(false);
    const dadosAtuais = JSON.stringify([tipo, nome, valor, categoria, categoriaReceita, data, repetir, fim]);
    const dadosIniciais = useRef(dadosAtuais);
    useConfirmarSaida(!concluido && dadosAtuais !== dadosIniciais.current);
    useEffect(() => { if (concluido) navigation.goBack(); }, [concluido, navigation]);
    const [erro, setErro] = useState<string | null>(null);

    // Se o lançamento tem uma categoria fora da lista padrão, ela aparece como opção para não se perder.
    const categorias: string[] = [...categoriasDeGasto];
    if (!categorias.includes(categoria)) categorias.push(categoria);
    const opcoesDeCategoria = categorias.map((item) => ({ valor: item, texto: item }));

    const ehReceita = tipo === 'INCOME';

    async function salvar() {
        if (ocupada.current) return;
        setErroCampo({});
        setErro(null);
        const valorNumerico = lerDecimal(valor, 17, 2);
        const dataIso = brParaIso(data);

        if (!nome.trim()) {
            setErroCampo({ descricao: 'Informe uma descrição.' });
            descricaoRef.current?.focus();
            return;
        }
        if (valorNumerico === null || Number(valorNumerico) <= 0) {
            setErroCampo({ valor: 'Informe um valor positivo com até 2 casas decimais.' });
            valorRef.current?.focus();
            return;
        }
        if (!dataIso) return setErro('Informe uma data válida (DD/MM/AAAA).');

        const ultimaData = fim.trim() ? brParaIso(fim) : null;
        const recorrente = tipo === 'EXPENSE_FIXED' && repetir === 'mensal';
        if (recorrente && fim.trim() && (!ultimaData || ultimaData < dataIso)) return setErro('Informe um último vencimento válido.');
        ocupada.current = true;
        setSalvando(true);
        setErro(null);
        try {
            const dados = {
                nome: nome.trim(),
                valor: valorNumerico,
                tipo,
                categoria: ehReceita ? categoriaReceita : categoria,
                data: dataIso,
            };
            if (recorrente) await salvarRecorrencia({ description: dados.nome, category: categoria, amount: dados.valor, firstDate: gastoEditado?.data ?? dataIso, lastDate: ultimaData, existingCashFlowId: gastoEditado?.id }, regra?.id);
            else if (gastoEditado) await atualizarMovimentacao(gastoEditado.id, dados, valor === decimalParaCampo(gastoEditado.valorExato));
            else await criarMovimentacao(dados);
            avisarSucesso(recorrente ? 'Recorrência salva.' : 'Lançamento salvo.');
            setConcluido(true);
        } catch (falha) {
            setErro(mensagemDeErroDeGravacao(falha));
        } finally {
            ocupada.current = false;
            setSalvando(false);
        }
    }

    async function excluir() {
        if (ocupada.current || (!gastoEditado && !regra)) return;
        ocupada.current = true;
        setExcluindo(true);
        setErro(null);
        try {
            if (regra) await encerrarRecorrencia(regra.id);
            else if (gastoEditado) await excluirMovimentacao(gastoEditado.id);
            avisarSucesso(regra ? 'Recorrência encerrada.' : 'Lançamento excluído.');
            setConcluido(true);
        } catch (falha) {
            setErro(mensagemDeErroDeGravacao(falha));
        } finally {
            ocupada.current = false;
            setExcluindo(false);
        }
    }

    return (
        <Layout formulario
            titulo={regra ? 'Editar recorrência' : editando ? 'Editar lançamento' : 'Novo lançamento'}
            subtitulo={regra ? 'Alterações valem para os próximos vencimentos' : gastoEditado && tipo === 'EXPENSE_FIXED' && repetir === 'mensal' ? 'Este lançamento será a primeira ocorrência da regra mensal' : editando ? 'Altere os dados ou exclua o lançamento' : 'Registre um gasto ou uma receita'}
            voltar
        >
            {!regra && <Opcoes rotulo="Tipo" opcoes={tipos} selecionado={tipo} onSelecionar={setTipo} />}
            <Field
                ref={valorRef}
                erro={erroCampo.valor}
                label="Valor (R$)"
                financeiro
                placeholder="0,00"
                keyboardType="decimal-pad"
                value={valor}
                onChangeText={setValor}
            />
            <Field ref={descricaoRef} erro={erroCampo.descricao} label="Descrição" placeholder="Ex.: Supermercado" value={nome} onChangeText={setNome} />
            {ehReceita ? (
                <Opcoes
                    rotulo="Categoria"
                    opcoes={[...new Set([...categoriasDeReceita, categoriaReceita])].map((item) => ({ valor: item, texto: item }))}
                    selecionado={categoriaReceita}
                    onSelecionar={setCategoriaReceita}
                />
            ) : (
                <Opcoes
                    rotulo="Categoria"
                    opcoes={opcoesDeCategoria}
                    selecionado={categoria}
                    onSelecionar={setCategoria}
                />
            )}
            {!regra && tipo === 'EXPENSE_FIXED' && (!gastoEditado || tipoDaMovimentacao(gastoEditado) === 'EXPENSE_FIXED') && <Opcoes rotulo="Repetição" opcoes={[{ valor: 'avulso', texto: 'Avulso' }, { valor: 'mensal', texto: 'Repetir mensalmente' }]} selecionado={repetir} onSelecionar={setRepetir} />}
            {ehReceita ? <Text style={styles.aviso}>A categoria Salário substitui a previsão do perfil no orçamento do mês.</Text> : null}
            {regra || (gastoEditado && tipo === 'EXPENSE_FIXED' && repetir === 'mensal')
                ? <Text style={styles.aviso}>Primeiro vencimento · {data}</Text>
                : <CampoData label={tipo === 'EXPENSE_FIXED' && repetir === 'mensal' ? 'Primeiro vencimento' : 'Data'} value={data} onChange={setData} />}
            {tipo === 'EXPENSE_FIXED' && repetir === 'mensal' && <CampoData opcional label="Último vencimento (opcional)" value={fim} onChange={setFim} />}

            {tipo === 'EXPENSE_FIXED' && repetir === 'mensal' && <Text style={styles.aviso}>A despesa será registrada no dia do primeiro vencimento. Em meses mais curtos, será registrada no último dia.</Text>}
            {erro ? <Text accessibilityLiveRegion="polite" style={styles.erro}>{erro}</Text> : null}
            <BotaoPrimario titulo={editando ? 'Salvar alterações' : 'Salvar'} onPress={salvar} carregando={salvando} desabilitado={excluindo} />
            {editando ? <BotaoExcluir rotulo={regra ? 'Encerrar recorrência' : 'Excluir lançamento'} detalhe={regra ? `Encerrar ${regra.description}? Os lançamentos anteriores permanecem.` : `Excluir ${gastoEditado?.nome ?? 'este lançamento'}?`} onConfirmar={excluir} carregando={excluindo} /> : null}
        </Layout>
    );
}

const styles = StyleSheet.create({
    aviso: {
        color: colors.textMuted,
        fontSize: 13,
    },
    erro: {
        color: colors.negative,
        fontSize: 13,
    },
});
