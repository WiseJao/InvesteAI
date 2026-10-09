import { ScrollView, Text, View } from 'react-native';
import { globalStyles } from '../../styles/global';
import CardAtivo  from './components/CardAtivo';
import Botao from './components/Botao';

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
          <View style={globalStyles.container_elementos}>
            <Text style={globalStyles.subtitle}>Saldo Investido: </Text>
            <Text style={globalStyles.title}>1000 </Text>
          </View>


            <View style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                padding: 15
            }}>
                <Botao 
                titulo={'Adicionar\nInvestimentos'}
                onPress={() => console.log('Add invest')}
                icone = "add"/> 
                <Botao
                titulo={'Renda\nvariável'}
                onPress={() => console.log('renda var')}
                icone = "trending-up"/> 
                <Botao
                titulo={'Renda\nfixa'}
                onPress={() => console.log('renda fixa')} // mudar esse icone depois, n achei nenhum bom
                icone = "home"/> 
                <Botao
                titulo={'Acessoria'}
                onPress={() => console.log('Acess')}
                icone = "chatbubbles"/> 
                <Botao
                titulo={'Meus\ninvestimentos'}
                onPress={() => console.log('meus invests')}
                icone = "wallet"/> 
            </View>

            <View style={globalStyles.container_elementos}> 
                <Text style={globalStyles.title}>Renda Variável</Text>
            

            {ativos.map((ativo) => (
                <CardAtivo
                    key={ativo.ticker}
                    ticker={ativo.ticker}
                    empresa={ativo.empresa}
                    preco={ativo.preco}
                    variacao={ativo.variacao}/>
            ))}
            </View>
        </ScrollView>
    );
}


