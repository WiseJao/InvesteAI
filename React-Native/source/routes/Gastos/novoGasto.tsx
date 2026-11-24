import { useState } from 'react';
import { Text, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Layout from '../../shared/layout';
import Field from '../../shared/field';
import Opcoes from '../../shared/opcoes';
import BotaoPrimario from '../../shared/botaoPrimario';
import { lerValor } from '../../shared/currency';
import { brParaIso, isoParaBr, hojeIso, mascaraData } from '../../shared/datas';
import { mensagemDeErro } from '../../services/api';
import { criarMovimentacao, type TipoMovimentacao } from '../../services/gastos';
import { colors } from '../../styles/colors';
import { categoriasDeGasto } from './dados';

const tipos: readonly { valor: TipoMovimentacao; texto: string }[] = [
    { valor: 'EXPENSE_VARIABLE', texto: 'Gasto variável' },
    { valor: 'EXPENSE_FIXED', texto: 'Gasto fixo' },
    { valor: 'INCOME', texto: 'Receita' },
];

const opcoesDeCategoria = categoriasDeGasto.map((categoria) => ({ valor: categoria, texto: categoria }));

export default function NovoGasto() {
    const navigation = useNavigation();
    const [tipo, setTipo] = useState<TipoMovimentacao>('EXPENSE_VARIABLE');
    const [nome, setNome] = useState('');
    const [valor, setValor] = useState('');
    const [categoria, setCategoria] = useState<string>(categoriasDeGasto[0]);
    const [data, setData] = useState(isoParaBr(hojeIso()));
    const [salvando, setSalvando] = useState(false);
    const [erro, setErro] = useState<string | null>(null);

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
            await criarMovimentacao({
                nome: nome.trim(),
                valor: valorNumerico,
                tipo,
                categoria: ehReceita ? 'Renda' : categoria,
                data: dataIso,
            });
            navigation.goBack();
        } catch (falha) {
            setErro(mensagemDeErro(falha));
        } finally {
            setSalvando(false);
        }
    }

    return (
        <Layout titulo="Novo lançamento" subtitulo="Registre um gasto ou uma receita" voltar>
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
            <BotaoPrimario titulo="Salvar" onPress={salvar} carregando={salvando} />
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
