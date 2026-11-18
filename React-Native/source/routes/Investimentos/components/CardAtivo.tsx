
import {
  View,
  Text,
  StyleSheet,
  Image,
  Pressable,
  Modal,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../../../styles/colors';
import { LineChart } from "react-native-chart-kit/v2";
import { useState } from 'react';

const data = [
  { month: "Jan", revenue: 52 },
  { month: "Feb", revenue: 86 },
  { month: "Mar", revenue: 58 },
  { month: "Apr", revenue: 134 },
  { month: "May", revenue: 95 },
  { month: "Jun", revenue: 176 }
];

type RevenueChartProps = {
  width?: number;
  height?: number;
};

export function RevenueChart({ width = 80, height = 80 }: RevenueChartProps) {
  return (
    <LineChart
      data={data}
      xKey="month"
      yKey="revenue"
      width={width}
      height={height}
    />
  );
}
type CardAtivoProps = {
  ticker: string;
  empresa: string;
  preco: string;
  variacao: string;
  logo: string
};

export default function CardAtivo({
  ticker,
  empresa,
  preco,
  variacao,
  logo,
}: CardAtivoProps) {
  const [modalDetalhesVisivel, setModalDetalhesVisivel] = useState(false);
  const { width: larguraTela } = useWindowDimensions();
  const larguraGrafico = Math.min(larguraTela - 76, 420);

  return (
    <>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Ver detalhes de ${ticker}`}
        style={styles.card}
        onPress={() => setModalDetalhesVisivel(true)}
      >
        <View style={styles.logo}>
          {logo ? (
            <Image
              source={{ uri: logo }}
              style={styles.imagemLogo}
              resizeMode="contain"
            />
          ) : null}
        </View>

        <View style={styles.identificacao}>
          <Text style={styles.ticker}>{ticker}</Text>
          <Text style={styles.empresa}>{empresa}</Text>
        </View>

        <View style={styles.financeiro}>
          <Text style={styles.preco}>{preco}</Text>

          <View >

          </View>
        </View>

        <View style={[styles.variacao, variacao.startsWith('-') && styles.variacaoNegativa]}>
          <Text style={[styles.variacaoTexto, variacao.startsWith('-') && styles.variacaoTextoNegativa]}>
            {variacao}
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
            <View accessibilityViewIsModal style={styles.modalConteudo}>
              <View style={styles.modalCabecalho}>
                <Text style={styles.modalTitulo}>Detalhes do investimento</Text>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Fechar modal"
                  onPress={() => setModalDetalhesVisivel(false)}
                >
                  <Text style={styles.modalFechar}>Fechar</Text>
                </Pressable>
              </View>

              <View style={styles.modalAtivo}>
                {logo ? (
                  <Image
                    source={{ uri: logo }}
                    style={styles.modalLogo}
                    resizeMode="contain"
                  />
                ) : null}
                <View style={styles.modalIdentificacao}>
                  <Text style={styles.modalTicker}>{ticker}</Text>
                  <Text style={styles.modalEmpresa}>{empresa}</Text>
                </View>
              </View>

              <View style={styles.modalIndicadores}>
                <View>
                  <Text style={styles.modalRotulo}>Preço atual</Text>
                  <Text style={styles.modalPreco}>{preco}</Text>
                </View>
                <View style={styles.modalVariacaoContainer}>
                  <Text style={styles.modalRotulo}>Variação</Text>
                  <Text style={[
                    styles.modalVariacao,
                    variacao.startsWith('-') && styles.modalVariacaoNegativa,
                  ]}>
                    {variacao}
                  </Text>
                </View>
              </View>

              <Text style={styles.modalGraficoTitulo}>Variação no período</Text>
              <View style={styles.modalGrafico}>
                <RevenueChart width={larguraGrafico} height={220} />
              </View>
              <Text style={styles.modalNota}>
                Gráfico ilustrativo com dados genéricos.
              </Text>
            </View>
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
    paddingVertical: 6,
    paddingHorizontal: 8,
  },

  logo: {
    width: 43,
    height: 43,
    borderRadius: 10,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
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
    fontSize: 10,
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
    fontSize: 9,
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

  imagemLogo: {
    width: 43,
    height: 43,
    borderRadius: 10,
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
    padding: 18,
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

  modalLogo: {
    width: 44,
    height: 44,
    borderRadius: 10,
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

  modalGraficoTitulo: {
    color: colors.text,
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 18,
  },

  modalGrafico: {
    alignItems: 'center',
    marginTop: 8,
    overflow: 'hidden',
  },

  modalNota: {
    color: colors.textMuted,
    fontSize: 11,
    textAlign: 'center',
  },
});

