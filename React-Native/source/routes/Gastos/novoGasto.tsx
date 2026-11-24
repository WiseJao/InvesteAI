import { useState } from 'react';
import { Text, StyleSheet } from 'react-native';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import Layout from '../../shared/layout';
import Field from '../../shared/field';
import Opcoes from '../../shared/opcoes';
import BotaoPrimario from '../../shared/botaoPrimario';
import BotaoExcluir from '../../shared/botaoExcluir';
import { lerValor, valorParaCampo } from '../../shared/currency';
import { brParaIso, isoParaBr, hojeIso, mascaraData } from '../../shared/datas';
import { mensagemDeErro } from '../../services/api';
import {
    atualizarMovimentacao,
    criarMovimentacao,
    excluirMovimentacao,
    tipoDaMovimentacao,
    type TipoMovimentacao,
} from '../../services/gastos';
import { colors } from '../../styles/colors';
import { categoriasDeGasto } from './dados';
import type { GastosStackParamList } from './types';

const tipos: readonly { valor: TipoMovimentacao; texto: string }[] = [
    { valor: 'EXPENSE_VARIABLE', texto: 'Gasto variável' },
    { valor: 'EXPENSE_FIXED', texto: 'Gasto fixo' },
    { valor: 'INCOME', texto: 'Receita' },
];


export default function NovoGasto() {
    const navigation = useNavigation();
    const route = useRoute<RouteProp<GastosStackParamList, 'NovoGasto'>>();
    const gastoEditado = route.params?.gasto;
    const editando = gastoEditado !== undefined;

    const [tipo, setTipo] = useState<TipoMovimentacao>(gastoEditado ? tipoDaMovimentacao(gastoEditado) : 'EXPENSE_VARIABLE');
    const [nome, setNome] = useState(gastoEditado?.nome ?? '');
    const [valor, setValor] = useState(gastoEditado ? valorParaCampo(gastoEditado.valor) : '');
    const [categoria, setCategoria] = useState<string>(
        gastoEditado && !gastoEditado.entrada ? gastoEditado.categoria : categoriasDeGasto[0],
    );
    const [data, setData] = useState(isoParaBr(gastoEditado?.data ?? hojeIso()));
    const [salvando, setSalvando] = useState(false);
    const [excluindo, setExcluindo] = useState(false);
    const [erro, setErro] = useState<string | null>(null);

    // Se o lançamento tem uma categoria fora da lista padrão, ela aparece como opção para não se perder.
    const categorias: string[] = [...categoriasDeGasto];
    if (!categorias.includes(categoria)) categorias.push(categoria);
    const opcoesDeCategoria = categorias.map((item) => ({ valor: item, texto: item }));

    const ehReceita = tipo === 'INCOME';

    async function salvar() {
        const valorNumerico = lerValor(valor);
        const dataIso = brParaIso(data);

        if (!nome.trim()) return setErro('Informe uma descrição.');
        if (valorNumerico === null || valorNumerico <= 0) return setErro('Informe um valor maior que zero.');
        if (!dataIso) return setErro('Informe uma data válida (DD/MM/AAAA).');

        setSalvando(true);
        setErro(null);
        try {
            const dados = {
                nome: nome.trim(),
                valor: valorNumerico,
                tipo,
                categoria: ehReceita ? 'Renda' : categoria,
                data: dataIso,
            };
            if (gastoEditado) await atualizarMovimentacao(gastoEditado.id, dados);
            else await criarMovimentacao(dados);
            navigation.goBack();
        } catch (falha) {
            setErro(mensagemDeErro(falha));
        } finally {
            setSalvando(false);
        }
    }

    async function excluir() {
        if (!gastoEditado) return;
        setExcluindo(true);
        setErro(null);
        try {
            await excluirMovimentacao(gastoEditado.id);
            navigation.goBack();
        } catch (falha) {
            setErro(mensagemDeErro(falha));
        } finally {
            setExcluindo(false);
        }
    }

    return (
        <Layout
            titulo={editando ? 'Editar lançamento' : 'Novo lançamento'}
            subtitulo={editando ? 'Altere os dados ou exclua o lançamento' : 'Registre um gasto ou uma receita'}
            voltar
        >
            <Opcoes rotulo="Tipo" opcoes={tipos} selecionado={tipo} onSelecionar={setTipo} />
            <Field label="Descrição" placeholder="Ex.: Supermercado" value={nome} onChangeText={setNome} />
            <Field
                label="Valor (R$)"
                placeholder="0,00"
                keyboardType="decimal-pad"
                value={valor}
                onChangeText={setValor}
            />
            {ehReceita ? null : (
                <Opcoes
                    rotulo="Categoria"
                    opcoes={opcoesDeCategoria}
                    selecionado={categoria}
                    onSelecionar={setCategoria}
                />
            )}
            <Field
                label="Data"
                placeholder="DD/MM/AAAA"
                keyboardType="numeric"
                maxLength={10}
                value={data}
                onChangeText={(texto) => setData(mascaraData(texto))}
            />

            {erro ? <Text style={styles.erro}>{erro}</Text> : null}
            <BotaoPrimario titulo={editando ? 'Salvar alterações' : 'Salvar'} onPress={salvar} carregando={salvando} desabilitado={excluindo} />
            {editando ? <BotaoExcluir rotulo="Excluir lançamento" onConfirmar={excluir} carregando={excluindo} /> : null}
        </Layout>
    );
}

const styles = StyleSheet.create({
    erro: {
        color: colors.negative,
        fontSize: 12,
        marginBottom: 8,
    },
});
