
import { View, Text, StyleSheet, Image } from 'react-native';
import { colors } from '../../../styles/colors';

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
  return (
    <View style={styles.card}>
      <View style={styles.logo} >
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

        <View style={[styles.variacao, variacao.startsWith('-') && styles.variacaoNegativa]}>
          <Text style={[styles.variacaoTexto, variacao.startsWith('-') && styles.variacaoTextoNegativa]}>
            {variacao}
          </Text>
        </View>
      </View>

      <View style={styles.grafico}>
        <Text>Grafico</Text>
      </View>
    </View>
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
    alignSelf: 'flex-start',
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
});

