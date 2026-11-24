import { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Field from '../../../shared/field';
import BotaoPrimario from '../../../shared/botaoPrimario';
import { lerValor } from '../../../shared/currency';
import { brParaIso, hojeIso, isoParaBr, mascaraData } from '../../../shared/datas';
import { mensagemDeErro } from '../../../services/api';
import { adicionarAtivo } from '../../../services/carteira';
import { colors } from '../../../styles/colors';

type FormNovoAtivoProps = {
    tipo: string;
    onCancelar: () => void;
    onSalvo: () => void;
};

export default function FormNovoAtivo({ tipo, onCancelar, onSalvo }: FormNovoAtivoProps) {
    const [simbolo, setSimbolo] = useState('');
    const [nome, setNome] = useState('');
    const [quantidade, setQuantidade] = useState('');
    const [preco, setPreco] = useState('');
    const [data, setData] = useState(isoParaBr(hojeIso()));
    const [salvando, setSalvando] = useState(false);
    const [erro, setErro] = useState<string | null>(null);

    async function salvar() {
        const quantidadeNumerica = lerValor(quantidade);
        const precoNumerico = lerValor(preco);
        const dataIso = brParaIso(data);

        if (!simbolo.trim()) return setErro('Informe o código do ativo.');
        if (quantidadeNumerica === null || quantidadeNumerica <= 0) return setErro('Informe uma quantidade maior que zero.');
        if (precoNumerico === null || precoNumerico < 0) return setErro('Informe o preço de compra.');
        if (!dataIso) return setErro('Informe uma data válida (DD/MM/AAAA).');

        setSalvando(true);
        setErro(null);
        try {
            await adicionarAtivo({
                simbolo: simbolo.trim(),
                nome: nome.trim() || simbolo.trim().toUpperCase(),
                quantidade: quantidadeNumerica,
                precoCompra: precoNumerico,
                data: dataIso,
            });
            onSalvo();
        } catch (falha) {
            setErro(mensagemDeErro(falha));
        } finally {
            setSalvando(false);
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
            <BotaoPrimario titulo="Salvar investimento" onPress={salvar} carregando={salvando} />
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
