import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Opcoes from '../../../shared/opcoes';
import Field from '../../../shared/field';
import CampoData from '../../../shared/campoData';
import BotaoPrimario from '../../../shared/botaoPrimario';
import BotaoExcluir from '../../../shared/botaoExcluir';
import { compararDecimais, decimalParaCampo, lerDecimal } from '../../../shared/currency';
import { brParaIso, hojeIso, isoParaBr } from '../../../shared/datas';
import { mensagemDeErro } from '../../../services/api';
import { adicionarAtivo, atualizarAtivo, buscarAtivos, excluirAtivo, obterPrecoReferencia, type Ativo, type PrecoReferencia, type ProdutoRendaFixa, type ResultadoBusca } from '../../../services/carteira';
import { colors } from '../../../styles/colors';
import { usePrivacidade } from '../../../shared/privacidade';

type FormNovoAtivoProps = {
    tipo: string;
    ativo?: Ativo;
    onCancelar: () => void;
    onSalvo: () => void;
};

export default function FormNovoAtivo({ tipo, ativo, onCancelar, onSalvo }: FormNovoAtivoProps) {
    const { oculto } = usePrivacidade();
    const editando = Boolean(ativo);
    const investmentType = ativo?.investmentType ?? (tipo === 'Renda fixa' ? 'FIXED_INCOME' : 'VARIABLE_INCOME');
    const fixed = investmentType === 'FIXED_INCOME';
    const oldQuantity = fixed && ativo && !ativo.fixedIncome?.product;
    const [product, setProduct] = useState<ProdutoRendaFixa>(ativo?.fixedIncome?.product ?? 'CDB');
    const [institution, setInstitution] = useState(ativo?.fixedIncome?.institution ?? '');
    const [modality, setModality] = useState<'prefixada' | 'cdi'>(ativo ? ativo.fixedIncome?.cdiPercentage ? 'cdi' : 'prefixada' : 'cdi');
    const [cdi, setCdi] = useState(ativo?.fixedIncome?.cdiPercentage ? decimalParaCampo(ativo.fixedIncome.cdiPercentage) : '');
    const [maturity, setMaturity] = useState(ativo?.fixedIncome?.maturityDate ? isoParaBr(ativo.fixedIncome.maturityDate) : '');
    const [simbolo, setSimbolo] = useState(ativo?.simbolo ?? '');
    const [nome, setNome] = useState(ativo && (fixed || ativo.nome !== ativo.simbolo) ? ativo.nome : '');
    const [selecionado, setSelecionado] = useState(Boolean(ativo));
    const [resultados, setResultados] = useState<ResultadoBusca[]>([]);
    const [buscando, setBuscando] = useState(false);
    const [erroBusca, setErroBusca] = useState<string | null>(null);
    const [tentativa, setTentativa] = useState(0);
    const [taxa, setTaxa] = useState(ativo?.annualRateExata == null ? '' : decimalParaCampo(ativo.annualRateExata));
    const [quantidade, setQuantidade] = useState(ativo ? decimalParaCampo(ativo.quantidadeExata) : fixed ? '1' : '');
    const [preco, setPreco] = useState(ativo ? decimalParaCampo(ativo.precoCompraExato) : '');
    const [data, setData] = useState(ativo ? (ativo.dataCompra ? isoParaBr(ativo.dataCompra) : '') : isoParaBr(hojeIso()));
    const [precoManual, setPrecoManual] = useState(editando);
    const [referencia, setReferencia] = useState<PrecoReferencia | null>(null);
    const [consultandoPreco, setConsultandoPreco] = useState(false);
    const [erroReferencia, setErroReferencia] = useState(false);
    const [excluindo, setExcluindo] = useState(false);
    const [salvando, setSalvando] = useState(false);
    const [erro, setErro] = useState<string | null>(null);

    useEffect(() => {
        const query = simbolo.trim();
        setResultados([]);
        setErroBusca(null);
        if (investmentType !== 'VARIABLE_INCOME' || selecionado || query.length < 2) {
            setBuscando(false);
            return;
        }
        let vigente = true;
        setBuscando(true);
        const timer = setTimeout(() => {
            void buscarAtivos(query).then((itens) => {
                if (vigente) setResultados(itens);
            }).catch((falha) => {
                if (vigente) setErroBusca(mensagemDeErro(falha));
            }).finally(() => {
                if (vigente) setBuscando(false);
            });
        }, 400);
        return () => { vigente = false; clearTimeout(timer); };
    }, [simbolo, selecionado, investmentType, tentativa]);

    const dataReferencia = brParaIso(data);
    useEffect(() => {
        setConsultandoPreco(false);
        setErroReferencia(false);
        if (editando || investmentType !== 'VARIABLE_INCOME' || !selecionado ||
            !dataReferencia || dataReferencia > hojeIso()) return;

        let vigente = true;
        setConsultandoPreco(true);
        const timer = setTimeout(() => {
            void obterPrecoReferencia(simbolo, dataReferencia).then((resultado) => {
                if (vigente) setReferencia(resultado);
            }).catch(() => {
                if (vigente) setErroReferencia(true);
            }).finally(() => {
                if (vigente) setConsultandoPreco(false);
            });
        }, 350);
        return () => { vigente = false; clearTimeout(timer); };
    }, [dataReferencia, editando, investmentType, selecionado, simbolo]);

    const precoInformado = !precoManual && referencia ? decimalParaCampo(referencia.price) : preco;

    async function salvar() {
        const quantidadeNumerica = lerDecimal(quantidade, 14, 10);
        const precoNumerico = lerDecimal(precoInformado, 14, 10);
        const dataIso = brParaIso(data);
        const taxaNumerica = lerDecimal(taxa, 4, 4);

        const codigo = fixed ? ativo?.simbolo ?? product : simbolo.trim();
        const cdiPercentage = lerDecimal(cdi, 4, 4);
        const maturityDate = maturity.trim() ? brParaIso(maturity) : null;
        if (fixed && !nome.trim()) return setErro('Informe o nome da aplicação.');
        if (fixed && maturity.trim() && (!maturityDate || (dataIso && maturityDate < dataIso))) return setErro('Informe um vencimento válido.');
        if (fixed && modality === 'cdi' && (cdiPercentage === null || Number(cdiPercentage) <= 0 || Number(cdiPercentage) > 1000)) return setErro('Informe um percentual do CDI entre 0 e 1000%.');
        if (!codigo) return setErro('Informe o código do ativo.');
        if (Array.from(simbolo.trim().toUpperCase()).length > 25) return setErro('O código deve ter no máximo 25 caracteres.');
        if (Array.from(nome.trim()).length > 380) return setErro('O nome deve ter no máximo 380 caracteres.');
        if (investmentType === 'VARIABLE_INCOME' && !selecionado) return setErro('Selecione um ativo dos resultados da busca.');
        if (fixed && modality === 'prefixada' && (taxaNumerica === null || Number(taxaNumerica) > 1000)) return setErro('Informe uma taxa entre 0 e 1000%, com até 4 casas decimais.');
        if (quantidadeNumerica === null || Number(quantidadeNumerica) <= 0) return setErro('Informe uma quantidade positiva com até 14 dígitos inteiros e 10 casas decimais.');
        if (ativo && compararDecimais(quantidadeNumerica, ativo.quantidadeOriginalExata) > 0) {
            // O backend só permite reduzir a quantidade de uma compra já registrada.
            return setErro(
                `Esta compra foi registrada com ${decimalParaCampo(ativo.quantidadeOriginalExata)} un. Para comprar mais, adicione um novo investimento.`,
            );
        }
        if (precoNumerico === null) return setErro('Informe um preço não negativo com até 14 dígitos inteiros e 10 casas decimais.');
        if (!dataIso && (data.trim() || !ativo || investmentType === 'FIXED_INCOME')) return setErro('Informe uma data válida (DD/MM/AAAA).');
        if (investmentType === 'FIXED_INCOME' && dataIso && dataIso > hojeIso()) return setErro('A data de compra não pode estar no futuro.');

        setSalvando(true);
        setErro(null);
        try {
            const dadosDoAtivo = {
                simbolo: codigo,
                nome: nome.trim() || simbolo.trim().toUpperCase(),
                quantidade: quantidadeNumerica,
                precoCompra: precoNumerico,
                data: dataIso,
                investmentType,
                annualRate: fixed && modality === 'prefixada' ? taxaNumerica : null,
                fixedIncome: fixed ? { product: oldQuantity ? null : product, institution: institution.trim() || null, cdiPercentage: modality === 'cdi' ? cdiPercentage : null, maturityDate } : undefined,
            };
            if (ativo) await atualizarAtivo(ativo.id, dadosDoAtivo, {
                quantidade: quantidade === decimalParaCampo(ativo.quantidadeExata),
                precoCompra: preco === decimalParaCampo(ativo.precoCompraExato),
                annualRate: taxa === (ativo.annualRateExata == null ? '' : decimalParaCampo(ativo.annualRateExata)),
            });
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
            {!fixed && <Field
                label={investmentType === 'VARIABLE_INCOME' ? 'Buscar ativo por código ou nome' : 'Código do ativo'}
                autoCapitalize="characters"
                value={simbolo}
                onChangeText={(texto) => { setSimbolo(texto); if (investmentType === 'VARIABLE_INCOME') { setSelecionado(false); setNome(''); setReferencia(null); } }}
            />}
            {investmentType === 'VARIABLE_INCOME' && !selecionado ? (
                <View>
                    {simbolo.trim().length < 2 ? <Text style={styles.info}>Digite ao menos 2 caracteres para buscar.</Text> : null}
                    {buscando ? <ActivityIndicator color={colors.primary} /> : null}
                    {erroBusca ? <Pressable accessibilityRole="button" onPress={() => setTentativa((valor) => valor + 1)}><Text style={styles.erro}>{erroBusca} Toque para tentar novamente.</Text></Pressable> : null}
                    {!buscando && !erroBusca && simbolo.trim().length >= 2 && resultados.length === 0 ? <Text style={styles.info}>Nenhum ativo encontrado.</Text> : null}
                    {resultados.map((resultado) => (
                        <Pressable key={resultado.simbolo} accessibilityRole="button" style={styles.resultado} onPress={() => { setSimbolo(resultado.simbolo); setNome(resultado.nome); setSelecionado(true); }}>
                            <Text style={styles.resultadoTexto}>{resultado.simbolo} — {resultado.nome}</Text>
                        </Pressable>
                    ))}
                </View>
            ) : null}
            {investmentType === 'VARIABLE_INCOME' && selecionado ? <Text style={styles.info}>Ativo selecionado: {simbolo} {nome ? `— ${nome}` : ''}</Text> : null}
            {fixed && !oldQuantity && <Opcoes rotulo="Produto" opcoes={[{ valor: 'CDB', texto: 'CDB' }, { valor: 'CAIXINHA', texto: 'Caixinha' }, { valor: 'OTHER', texto: 'Outro' }]} selecionado={product} onSelecionar={setProduct} />}
            <Field label={fixed ? 'Nome da aplicação' : 'Nome (opcional)'} value={nome} onChangeText={setNome} />
            {fixed && <Field label="Instituição (opcional)" value={institution} onChangeText={setInstitution} maxLength={100} />}
            {fixed && <Opcoes rotulo="Rentabilidade" opcoes={[{ valor: 'cdi', texto: '% do CDI' }, { valor: 'prefixada', texto: 'Prefixada' }]} selecionado={modality} onSelecionar={setModality} />}
            {fixed && modality === 'cdi' && <Field financeiro label="Percentual do CDI" placeholder="Ex.: 105" keyboardType="decimal-pad" value={cdi} onChangeText={setCdi} />}
            {fixed && modality === 'prefixada' ? <Field financeiro label="Taxa prefixada (% a.a.)" keyboardType="decimal-pad" value={taxa} onChangeText={setTaxa} hint="Estimativa por juros compostos, sem impostos ou garantia de rentabilidade." /> : null}
            {(!fixed || oldQuantity) && <Field financeiro label="Quantidade" keyboardType="decimal-pad" value={quantidade} onChangeText={setQuantidade} />}
            <CampoData
                label={fixed ? 'Data da aplicação' : 'Data da compra'}
                value={data}
                onChange={(valor) => {
                    if (brParaIso(valor) !== dataReferencia) setReferencia(null);
                    setData(valor);
                }}
                opcional={Boolean(ativo) && investmentType !== 'FIXED_INCOME'}
                impedirLimpeza={Boolean(ativo?.dataCompra) && investmentType !== 'FIXED_INCOME'}
            />
            {fixed && <CampoData label="Vencimento (opcional)" opcional value={maturity} onChange={setMaturity} />}
            <Field financeiro label={fixed && !oldQuantity ? 'Valor aplicado (R$)' : 'Preço de compra (R$)'} keyboardType="decimal-pad" value={precoInformado}
                onChangeText={(valor) => { setPrecoManual(true); setPreco(valor); }} />
            {!precoManual && consultandoPreco ? <Text accessibilityLiveRegion="polite" style={styles.info}>Consultando fechamento na BRAPI…</Text> : null}
            {!precoManual && referencia ? (
                <Text accessibilityLiveRegion="polite" style={styles.info}>
                    Fechamento de referência de {isoParaBr(referencia.tradingDate)} (BRAPI).
                    {referencia.raw ? '' : ' Pode incluir ajustes históricos.'} Você pode informar o valor pago.
                </Text>
            ) : null}
            {!precoManual && erroReferencia ? <Text accessibilityLiveRegion="polite" style={styles.info}>Preço de referência indisponível. Informe o valor pago.</Text> : null}

            {erro ? <Text style={styles.erro}>{oculto ? 'Confira os dados informados.' : erro}</Text> : null}
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
    info: { color: colors.textMuted, marginBottom: 8 },
    resultado: { paddingVertical: 10, borderTopWidth: 1, borderTopColor: colors.border },
    resultadoTexto: { color: colors.text },
    cancelar: {
        alignItems: 'center',
        padding: 12,
    },
    cancelarTexto: {
        color: colors.textMuted,
        fontSize: 14,
    },
});
