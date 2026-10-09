import { ScrollView, Text, View } from 'react-native';
import { globalStyles } from '../../styles/global';
import CardAtivo  from './components/CardAtivo';

const ativos = [
  {
    ticker: 'PETR4',
    empresa: 'Petrobras',
    preco: 'R$ 38,20',
    variacao: '+1,23 (6,7%)',
  },
  {
    ticker: 'BBTC',
    empresa: 'Bitcoin',
    preco: 'R$ 123,45',
    variacao: '+4,56 (12%)',
  },
  {
    ticker: 'VALE3',
    empresa: 'Vale',
    preco: 'R$ 78,90',
    variacao: '+5,60 (8%)',
  },
  {
    ticker: 'ITUB4',
    empresa: 'Itaú',
    preco: 'R$ 45,00',
    variacao: '+3,15 (5%)',
  },
];

export default function Investimentos() {
    return (
        <ScrollView style={globalStyles.container}>
            <Text style={globalStyles.subtitle}>Saldo Investido: </Text>
            <Text style={globalStyles.title}>1000 </Text>

            <View style={{
                flexDirection: 'row',
                justifyContent: 'space-between'
            }}>
                <text style={globalStyles.subtitle}>Adicionar Investimento </text>
                <text style={globalStyles.subtitle}>Renda Variável </text>
                <text style={globalStyles.subtitle}>Renda Fixa </text>
                <text style={globalStyles.subtitle}>Acessoria foda </text>
                <text style={globalStyles.subtitle}>Acessoria foda 2 </text>
                <text style={globalStyles.subtitle}>Acessoria foda 3</text>
            </View>

            <View> 
                <Text style={globalStyles.title}>Renda Variável</Text>
            </View>

            {ativos.map((ativo) => (
                <CardAtivo
                    key={ativo.ticker}
                    ticker={ativo.ticker}
                    empresa={ativo.empresa}
                    preco={ativo.preco}
                    variacao={ativo.variacao}/>
            ))}
        </ScrollView>
    );
}
