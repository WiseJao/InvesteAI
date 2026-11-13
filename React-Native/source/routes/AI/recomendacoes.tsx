import { Text, StyleSheet } from 'react-native';
import Layout from '../../shared/layout';
import Card from '../../shared/card';
import { colors } from '../../styles/colors';

// TODO: substituir pelas recomendações geradas pela API
const recomendacoes = [
    {
        titulo: 'Tesouro IPCA+ 2029',
        descricao: 'Proteção contra inflação com bom retorno para seus objetivos de longo prazo.',
    },
    {
        titulo: 'ETF de dividendos (BOVA11)',
        descricao: 'Diversificação em ações com exposição ao mercado brasileiro.',
    },
    {
        titulo: 'CDB 110% CDI',
        descricao: 'Renda fixa com liquidez para reserva de emergência.',
    },
    {
        titulo: 'Fundo imobiliário (FII)',
        descricao: 'Renda passiva mensal e diversificação em imóveis.',
    },
];

export default function Recomendacoes() {
    return (
        <Layout titulo="Recomendações" subtitulo="Baseado no seu perfil Moderado" voltar>
            {recomendacoes.map((item) => (
                <Card key={item.titulo}>
                    <Text style={styles.titulo}>{item.titulo}</Text>
                    <Text style={styles.descricao}>{item.descricao}</Text>
                </Card>
            ))}
        </Layout>
    );
}

const styles = StyleSheet.create({
    titulo: {
        fontSize: 14,
        fontWeight: 'bold',
        color: colors.text,
        marginBottom: 4,
    },
    descricao: {
        fontSize: 12,
        color: colors.textMuted,
    },
});
