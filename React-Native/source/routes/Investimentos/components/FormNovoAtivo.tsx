import { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Field from '../../../shared/field';
import BotaoPrimario from '../../../shared/botaoPrimario';
import BotaoExcluir from '../../../shared/botaoExcluir';
import { lerValor, quantidadeParaCampo, valorParaCampo } from '../../../shared/currency';
import { brParaIso, hojeIso, isoParaBr, mascaraData } from '../../../shared/datas';
import { mensagemDeErro } from '../../../services/api';
import { adicionarAtivo, atualizarAtivo, excluirAtivo, type Ativo } from '../../../services/carteira';
import { colors } from '../../../styles/colors';

type FormNovoAtivoProps = {
    tipo: string;
    ativo?: Ativo;
    onCancelar: () => void;
    onSalvo: () => void;
};

export default function FormNovoAtivo({ tipo, ativo, onCancelar, onSalvo }: FormNovoAtivoProps) {
    const editando = Boolean(ativo);
    const [simbolo, setSimbolo] = useState(ativo?.simbolo ?? '');
    const [nome, setNome] = useState(ativo && ativo.nome !== ativo.simbolo ? ativo.nome : '');
    const [quantidade, setQuantidade] = useState(ativo ? quantidadeParaCampo(ativo.quantidade) : '');
    const [preco, setPreco] = useState(ativo ? valorParaCampo(ativo.precoCompra) : '');
    const [data, setData] = useState(isoParaBr(ativo?.dataCompra ?? hojeIso()));
    const [excluindo, setExcluindo] = useState(false);
    const [salvando, setSalvando] = useState(false);
    const [erro, setErro] = useState<string | null>(null);

    async function salvar() {
        const quantidadeNumerica = lerValor(quantidade);
        const precoNumerico = lerValor(preco);
        const dataIso = brParaIso(data);

        if (!simbolo.trim()) return setErro('Informe o código do ativo.');
        if (quantidadeNumerica === null || quantidadeNumerica <= 0) return setErro('Informe uma quantidade maior que zero.');
        if (ativo && quantidadeNumerica > ativo.quantidadeOriginal) {
            // O backend só permite reduzir a quantidade de uma compra já registrada.
            return setErro(
                `Esta compra foi registrada com ${quantidadeParaCampo(ativo.quantidadeOriginal)} un. Para comprar mais, adicione um novo investimento.`,
            );
        }
        if (precoNumerico === null || precoNumerico < 0) return setErro('Informe o preço de compra.');
        if (!dataIso) return setErro('Informe uma data válida (DD/MM/AAAA).');

        setSalvando(true);
        setErro(null);
        try {
            const dadosDoAtivo = {
                simbolo: simbolo.trim(),
                nome: nome.trim() || simbolo.trim().toUpperCase(),
                quantidade: quantidadeNumerica,
                precoCompra: precoNumerico,
                data: dataIso,
            };
            if (ativo) await atualizarAtivo(ativo.id, dadosDoAtivo);
            else await adicionarAtivo(dadosDoAtivo);
            onSalvo();
        } catch (falha) {
            setErro(mensagemDeErro(falha));
        } finally {
            setSalvando(false);
        }
    }

    async function excluir() {
        if (!ativo) return;
        setExcluindo(true);
        setErro(null);
        try {
            await excluirAtivo(ativo.id);
            onSalvo();
        } catch (falha) {
            setErro(mensagemDeErro(falha));
        } finally {
            setExcluindo(false);
        }
    }

    return (
        <View>
            <Text style={styles.titulo}>{tipo}</Text>
            <Field
                label={tipo === 'Renda fixa' ? 'Código do título (ex.: CDB110)' : 'Código do ativo (ex.: PETR4)'}
                autoCapitalize="characters"
                value={simbolo}
                onChangeText={setSimbolo}
            />
            <Field label="Nome (opcional)" value={nome} onChangeText={setNome} />
            <Field label="Quantidade" keyboardType="numeric" value={quantidade} onChangeText={setQuantidade} />
            <Field label="Preço de compra (R$)" keyboardType="numeric" value={preco} onChangeText={setPreco} />
            <Field
                label="Data da compra"
                placeholder="DD/MM/AAAA"
                keyboardType="numeric"
                maxLength={10}
                value={data}
                onChangeText={(texto) => setData(mascaraData(texto))}
            />

            {erro ? <Text style={styles.erro}>{erro}</Text> : null}
            <BotaoPrimario
                titulo={editando ? 'Salvar alterações' : 'Salvar investimento'}
                onPress={salvar}
                carregando={salvando}
                desabilitado={excluindo}
            />
            {editando ? (
                <BotaoExcluir rotulo="Excluir investimento" onConfirmar={excluir} carregando={excluindo} />
            ) : null}
            <TouchableOpacity onPress={onCancelar} style={styles.cancelar}>
                <Text style={styles.cancelarTexto}>Cancelar</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    titulo: {
        color: colors.text,
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 12,
    },
    erro: {
        color: colors.negative,
        fontSize: 12,
        marginBottom: 8,
    },
    cancelar: {
        alignItems: 'center',
        padding: 12,
    },
    cancelarTexto: {
        color: colors.textMuted,
        fontSize: 14,
    },
});
