import ImagemAtivo from './ImagemAtivo';

import {
  ActivityIndicator,
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, ui } from '../../../styles/colors';
import { LineChart } from "react-native-chart-kit/v2";
import { useEffect, useState } from 'react';
import { usePrivacidade } from '../../../shared/privacidade';

const API_URL = (
  process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:8080'
).replace(/\/$/, '');

const PERIODOS = [
  { range: '1d', label: '1 dia' },
  { range: '5d', label: '1 semana' },
  { range: '1mo', label: '1 mês' },
  { range: '3mo', label: '3 meses' },
] as const;

type PeriodoHistorico = (typeof PERIODOS)[number]['range'];
type PontoGrafico = { label: string; preco: number };

type HistoricalChartProps = {
  data: PontoGrafico[];
  width?: number;
  height?: number;
};

const temaDoGrafico = {
  background: colors.surfaceRaised,
  plotBackground: colors.surfaceRaised,
  grid: colors.border,
  axis: colors.controlBorder,
  text: colors.text,
  mutedText: colors.textMuted,
  series: [colors.primary],
  typography: { axisLabelSize: 12 },
};

function HistoricalChart({ data, width = 80, height = 80 }: HistoricalChartProps) {
  return (
    <LineChart
      data={data}
      xKey="label"
      yKey="preco"
      width={width}
      height={height}
      theme={temaDoGrafico}
      accessibilityLabel="Gráfico do histórico de preços"
      labelStrategy="auto"
      showDots={false}
    />
  );
}

function formatarPontosHistoricos(
  pontos: unknown,
  periodo: PeriodoHistorico,
): PontoGrafico[] {
  if (!Array.isArray(pontos)) {
    throw new Error('A resposta da API não contém os pontos do histórico esperados.');
  }

  return pontos.flatMap((ponto: unknown) => {
    if (typeof ponto !== 'object' || ponto === null) {
      return [];
    }

    const data = 'date' in ponto ? ponto.date : undefined;
    const precoAbertura = 'open' in ponto ? ponto.open : undefined;
    const precoAjustado = 'adjustedClose' in ponto ? ponto.adjustedClose : undefined;
    const precoFechamento = 'close' in ponto ? ponto.close : undefined;
    const preco = typeof precoAjustado === 'number' && Number.isFinite(precoAjustado)
      ? precoAjustado
      : precoFechamento;

    if (
      typeof data !== 'number'
      || !Number.isFinite(data)
      || typeof preco !== 'number'
      || !Number.isFinite(preco)
    ) {
      return [];
    }

    if (
      periodo === '1d'
      && typeof precoAbertura === 'number'
      && Number.isFinite(precoAbertura)
    ) {
      return [
        { label: 'Abertura', preco: precoAbertura },
        { label: 'Fechamento', preco },
      ];
    }

    const instante = new Date(data * 1000);
    const label = instante.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });

    return [{ label, preco }];
  });
}
type CardAtivoProps = {
  ticker: string;
  empresa: string;
  preco: string;
  variacao: string;
  logo: string;
  dataCotacao?: string;
  onAdicionar?: () => void;
};

export default function CardAtivo({
  ticker,
  empresa,
  preco,
  variacao,
  logo,
  dataCotacao,
  onAdicionar,
}: CardAtivoProps) {
  const { oculto } = usePrivacidade();
  const [reconsulta, setReconsulta] = useState(0);
  const [mostrarLista, setMostrarLista] = useState(false);
  const [modalDetalhesVisivel, setModalDetalhesVisivel] = useState(false);
  const [cotacao, setCotacao] = useState<{ preco: number; horario?: string } | null>(null);
  const [carregandoCotacao, setCarregandoCotacao] = useState(false);
  const [reconsultarCotacao, setReconsultarCotacao] = useState(0);
  useEffect(() => {
    if (!modalDetalhesVisivel || dataCotacao) return;
    const controller = new AbortController();
    setCarregandoCotacao(true);
    void fetch(API_URL + '/investments/quotes?symbols=' + encodeURIComponent(ticker), { signal: controller.signal })
      .then(async resposta => {
        if (!resposta.ok) return;
        const dados = await resposta.json();
        const item = Array.isArray(dados.results) ? dados.results.find((entry: { symbol?: string }) => entry.symbol === ticker) : null;
        if (!controller.signal.aborted && typeof item?.regularMarketPrice === 'number') {
          setCotacao({ preco: item.regularMarketPrice, horario: item.regularMarketTime });
        }
      }).catch(() => {}).finally(() => {
        if (!controller.signal.aborted) setCarregandoCotacao(false);
      });
    return () => controller.abort();
  }, [modalDetalhesVisivel, dataCotacao, ticker, reconsultarCotacao]);
  const horarioCotacao = cotacao?.horario ? new Date(cotacao.horario) : null;
  const dataAtual = dataCotacao ?? (horarioCotacao && Number.isFinite(horarioCotacao.getTime())
    ? horarioCotacao.toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' }) : undefined);
  const precoAtual = cotacao ? cotacao.preco.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : preco;
  const [periodoSelecionado, setPeriodoSelecionado] = useState<PeriodoHistorico>('1mo');
  const [pontosHistoricos, setPontosHistoricos] = useState<PontoGrafico[]>([]);
  const [carregandoHistorico, setCarregandoHistorico] = useState(false);
  const [erroHistorico, setErroHistorico] = useState<string | null>(null);
  const [larguraGrafico, setLarguraGrafico] = useState(0);

  useEffect(() => {
    if (!modalDetalhesVisivel || oculto) {
      return;
    }

    let ativo = true;

    const carregarHistorico = async () => {
      setCarregandoHistorico(true);
      setErroHistorico(null);
      setPontosHistoricos([]);

      try {
        const resposta = await fetch(
          `${API_URL}/investments/history?symbol=${encodeURIComponent(ticker)}&range=${periodoSelecionado}`,
          { headers: { Accept: 'application/json' } },
        );

        if (!resposta.ok) {
          throw new Error(`Não foi possível carregar o histórico (HTTP ${resposta.status}).`);
        }

        const dados: unknown = await resposta.json();
        if (typeof dados !== 'object' || dados === null || !('results' in dados)) {
          throw new Error('A resposta da API não contém a lista de histórico esperada.');
        }

        const novosPontos = formatarPontosHistoricos(dados.results, periodoSelecionado);
        if (ativo) {
          setPontosHistoricos(novosPontos);
        }
      } catch (erroRequest) {
        if (ativo) {
          setErroHistorico(
            erroRequest instanceof Error
              ? erroRequest.message
              : `Não foi possível conectar à API em ${API_URL}.`,
          );
        }
      } finally {
        if (ativo) {
          setCarregandoHistorico(false);
        }
      }
    };

    void carregarHistorico();
    return () => {
      ativo = false;
    };
  }, [modalDetalhesVisivel, periodoSelecionado, ticker, reconsulta, oculto]);

  return (
    <>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Ver detalhes de ${ticker}`}
        style={styles.card}
        onPress={() => setModalDetalhesVisivel(true)}
      >
        <ImagemAtivo uri={logo} size={36} />

        <View style={styles.identificacao}>
          <Text style={styles.ticker}>{ticker}</Text>
          <Text style={styles.empresa}>{empresa}</Text>
        </View>

        <View style={styles.financeiro}>
          <Text style={styles.preco}>{oculto ? 'Valor oculto' : preco}</Text>

          <View >

          </View>
        </View>

        <View style={[styles.variacao, !oculto && variacao.startsWith('-') && styles.variacaoNegativa]}>
          <Text style={[styles.variacaoTexto, !oculto && variacao.startsWith('-') && styles.variacaoTextoNegativa]}>
            {oculto ? '••••' : variacao}
          </Text>
        </View>
      </Pressable>

      <Modal
        animationType="slide"
        transparent
        visible={modalDetalhesVisivel}
        onRequestClose={() => setModalDetalhesVisivel(false)}
      >
        <View style={styles.modalContainer}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Fechar detalhes do investimento"
            style={styles.modalBackdrop}
            onPress={() => setModalDetalhesVisivel(false)}
          />
          <SafeAreaView style={styles.modalSafeArea} edges={['top', 'bottom']}>
            <ScrollView accessibilityViewIsModal style={styles.modalConteudo} contentContainerStyle={{ padding: ui.space.lg }}>
              <View style={styles.modalCabecalho}>
                <Text style={styles.modalTitulo}>Detalhes do investimento</Text>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Fechar modal"
                  style={styles.acaoFechar}
                  onPress={() => setModalDetalhesVisivel(false)}
                >
                  <Text style={styles.modalFechar}>Fechar</Text>
                </Pressable>
              </View>

              <View style={styles.modalAtivo}>
                <ImagemAtivo uri={logo} size={48} />
                <View style={styles.modalIdentificacao}>
                  <Text style={styles.modalTicker}>{ticker}</Text>
                  <Text style={styles.modalEmpresa}>{empresa}</Text>
                </View>
              </View>

              <View style={styles.modalIndicadores}>
                <View>
                  <Text style={styles.modalRotulo}>Preço atual</Text>
                  <Text style={styles.modalPreco}>{oculto ? 'Valor oculto' : carregandoCotacao ? 'Atualizando…' : precoAtual}</Text>
                </View>
                <View style={styles.modalVariacaoContainer}>
                  <Text style={styles.modalRotulo}>Variação</Text>
                  <Text style={[
                    styles.modalVariacao,
                    !oculto && variacao.startsWith('-') && styles.modalVariacaoNegativa,
                  ]}>
                    {oculto ? 'Percentual oculto' : variacao}
                  </Text>
                </View>
              </View>

              <Text style={styles.modalNota}>BRAPI{dataAtual ? ' · ' + dataAtual : ' · horário indisponível'}</Text>
              {!dataAtual && !carregandoCotacao && <Pressable accessibilityRole="button" style={{ minHeight: 48 }} onPress={() => setReconsultarCotacao(v => v + 1)}><Text style={styles.modalFechar}>Atualizar cotação</Text></Pressable>}
              {onAdicionar && <Pressable accessibilityRole="button" style={{ minHeight: 48, justifyContent: 'center' }} onPress={() => { setModalDetalhesVisivel(false); onAdicionar(); }}><Text style={styles.modalFechar}>Adicionar à carteira</Text></Pressable>}
              <Text style={styles.modalGraficoTitulo}>Variação no período</Text>
              <View style={styles.filtrosPeriodo}>
                {PERIODOS.map((periodo) => (
                  <Pressable
                    key={periodo.range}
                    accessibilityRole="button"
                    accessibilityState={{ selected: periodoSelecionado === periodo.range }}
                    onPress={() => setPeriodoSelecionado(periodo.range)}
                    style={[
                      styles.filtroPeriodo,
                      periodoSelecionado === periodo.range && styles.filtroPeriodoAtivo,
                    ]}
                  >
                    <Text
                      style={[
                        styles.filtroPeriodoTexto,
                        periodoSelecionado === periodo.range && styles.filtroPeriodoTextoAtivo,
                      ]}
                    >
                      {periodo.label}
                    </Text>
                  </Pressable>
                ))}
              </View>
              <View style={styles.modalGrafico} onLayout={({ nativeEvent }) => setLarguraGrafico(Math.floor(nativeEvent.layout.width))}>
                {oculto ? <Text style={styles.estadoGrafico}>Gráfico oculto</Text> : carregandoHistorico ? (
                  <ActivityIndicator color={colors.primary} style={styles.estadoGrafico} />
                ) : erroHistorico ? (
                  <Pressable accessibilityRole="button" style={{ minHeight: 48 }} onPress={() => setReconsulta(v => v + 1)}><Text style={[styles.estadoGrafico, styles.erroGrafico]}>{erroHistorico} Tentar novamente</Text></Pressable>
                ) : pontosHistoricos.length < 2 ? (
                  <Text style={styles.estadoGrafico}>
                    Não há dados suficientes para exibir esse período.
                  </Text>
                ) : (
                  larguraGrafico > 0 && <HistoricalChart
                    data={pontosHistoricos}
                    width={larguraGrafico}
                    height={220}
                  />
                )}
              </View>
              {!oculto && pontosHistoricos.length > 0 && <Pressable accessibilityRole="button" accessibilityState={{ expanded: mostrarLista }} style={{ minHeight: 48 }} onPress={() => setMostrarLista(v => !v)}><Text style={styles.modalFechar}>{mostrarLista ? 'Ocultar lista de preços' : 'Ver lista de preços'}</Text></Pressable>}
              {!oculto && mostrarLista && <ScrollView style={{ maxHeight: 140 }} nestedScrollEnabled>{pontosHistoricos.map((ponto, i) => <Text key={i} style={styles.modalNota}>{ponto.label} · {ponto.preco.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</Text>)}</ScrollView>}
              <Text style={styles.modalNota}>
                {periodoSelecionado === '1d'
                  ? 'Dados diários: abertura e fechamento (plano gratuito).'
                  : 'Histórico de preços fornecido pela brapi.dev.'}
              </Text>
            </ScrollView>
          </SafeAreaView>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: ui.space.sm,
    paddingHorizontal: ui.space.sm,
    minHeight: ui.touch,
  },


  identificacao: {
    flex: 1,
    minWidth: 0,
    gap: 1,
  },

  ticker: {
    fontSize: 13,
    fontWeight: 'bold',
    color: colors.text,
  },

  empresa: {
    fontSize: ui.font.label,
    color: colors.textMuted,
  },

  financeiro: {
    width: 76,
    gap: 2,
  },

  preco: {
    fontSize: 16,
    color: colors.text,
  },

  variacao: {
    backgroundColor: colors.positive,
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 6,
    alignSelf: 'center',
  },

  variacaoNegativa: {
    backgroundColor: colors.negative,
  },

  variacaoTexto: {
    color: colors.onPrimary,
    fontSize: ui.font.label,
    fontWeight: 'bold',
  },

  variacaoTextoNegativa: {
    color: colors.text,
  },

  grafico: {
    width: 76,
    height: 43,
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 3,
    overflow: 'hidden',
    alignContent: 'center',
    justifyContent: 'center',
  },


  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },

  modalBackdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },

  modalSafeArea: {
    flex: 1,
    justifyContent: 'center',
  },

  modalConteudo: {
    alignSelf: 'center',
    width: '100%',
    maxWidth: 460,
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 16,
    borderWidth: 1,
    maxHeight: '94%',
    flexGrow: 0,
  },

  modalCabecalho: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  modalTitulo: {
    color: colors.text,
    fontSize: 18,
    fontWeight: 'bold',
  },

  modalFechar: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: 'bold',
    padding: 4,
  },

  modalAtivo: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },


  modalIdentificacao: {
    flex: 1,
  },

  modalTicker: {
    color: colors.text,
    fontSize: 17,
    fontWeight: 'bold',
  },

  modalEmpresa: {
    color: colors.textMuted,
    fontSize: 13,
    marginTop: 2,
  },

  modalIndicadores: {
    borderBottomColor: colors.border,
    borderBottomWidth: 1,
    borderTopColor: colors.border,
    borderTopWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 18,
    paddingVertical: 14,
  },

  modalVariacaoContainer: {
    alignItems: 'flex-end',
  },

  modalRotulo: {
    color: colors.textMuted,
    fontSize: 12,
  },

  modalPreco: {
    color: colors.text,
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 4,
  },

  modalVariacao: {
    color: colors.positive,
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 4,
  },

  modalVariacaoNegativa: {
    color: colors.negative,
  },

  acaoFechar: { minHeight: ui.touch, minWidth: ui.touch, justifyContent: 'center' },
  modalGraficoTitulo: {
    color: colors.text,
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 18,
  },

  filtrosPeriodo: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 10,
  },

  filtroPeriodo: {
    alignItems: 'center',
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    flex: 1,
    paddingHorizontal: 4,
    paddingVertical: 8,
  },

  filtroPeriodoAtivo: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },

  filtroPeriodoTexto: {
    color: colors.textMuted,
    fontSize: 11,
  },

  filtroPeriodoTextoAtivo: {
    color: colors.onPrimary,
    fontWeight: 'bold',
  },

  modalGrafico: {
    alignItems: 'center',
    marginTop: 8,
    minHeight: 220,
    width: '100%',
    justifyContent: 'center',
    overflow: 'hidden',
  },

  estadoGrafico: {
    color: colors.textMuted,
    paddingHorizontal: ui.space.sm,
    textAlign: 'center',
  },

  erroGrafico: {
    color: colors.negative,
  },

  modalNota: {
    color: colors.textMuted,
    fontSize: 11,
    textAlign: 'center',
  },
});

