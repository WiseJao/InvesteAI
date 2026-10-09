
import { View, Text, StyleSheet } from 'react-native';

type CardAtivoProps = {
  ticker: string;
  empresa: string;
  preco: string;
  variacao: string;
};

export default function CardAtivo({
  ticker,
  empresa,
  preco,
  variacao,
}: CardAtivoProps) {
  return (
    <View style={styles.card}>
      <View style={styles.logo} />

      <View style={styles.identificacao}>
        <Text style={styles.ticker}>{ticker}</Text>
        <Text style={styles.empresa}>{empresa}</Text>
      </View>

      <View style={styles.financeiro}>
        <Text style={styles.preco}>{preco}</Text>

        <View style={styles.variacao}>
          <Text style={styles.variacaoTexto}>
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
    backgroundColor: '#777777',
  },

  identificacao: {
    flex: 1,
    minWidth: 0,
    gap: 1,
  },

  ticker: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#ffffff',
  },

  empresa: {
    fontSize: 10,
    color: '#ffffff',
  },

  financeiro: {
    width: 76,
    gap: 2,
  },

  preco: {
    fontSize: 16,
    color: '#ffffff',
  },

  variacao: {
    backgroundColor: '#00B900',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },

  variacaoTexto: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: 'bold',
  },

  grafico: {
    width: 76,
    height: 43,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 3,
    overflow: 'hidden',
    alignContent :'center',
    justifyContent : 'center'
  },
});