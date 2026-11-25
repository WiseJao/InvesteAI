import { Text, StyleSheet } from 'react-native';
import Layout from '../../shared/layout';
import Card from '../../shared/card';
import Estado from '../../shared/estado';
import { useCarregar } from '../../shared/useCarregar';
import { listarRecomendacoes } from '../../services/assessoria';
import { colors } from '../../styles/colors';

const explicacoes: Record<string, string> = {
    'Renda Fixa': 'A forma de calcular a remuneração é definida na aplicação. Compare prazo, liquidez e risco do emissor.',
    'Ações / ETF': 'Ações representam participação em empresas. ETFs são fundos negociados em bolsa, e alguns acompanham um índice.',
    'Fundos Imobiliários': 'Fundos que investem em ativos do mercado imobiliário. O preço das cotas e os rendimentos podem variar.',
};

export default function Recomendacoes() {
    const { dados, carregando, erro, recarregar } = useCarregar(listarRecomendacoes);
    return (
        <Layout titulo="Exemplos educativos" subtitulo="Tipos de investimento para conhecer. O catálogo tem finalidade educacional." voltar>
            <Estado carregando={carregando} erro={erro} temDados={dados !== null} onTentarNovamente={recarregar}>
                {dados?.length === 0 && <Text style={styles.detalhe}>Nenhum exemplo disponível.</Text>}
                {Array.from(new Set((dados ?? []).map(item => item.categoria))).map(categoria => (
                    <Card key={categoria}>
                        <Text accessibilityRole="header" style={styles.titulo}>{categoria}</Text>
                        <Text style={styles.detalhe}>{explicacoes[categoria] ?? 'Confira as condições e os riscos da categoria.'}</Text>
                    </Card>
                ))}
            </Estado>
        </Layout>
    );
}

const styles = StyleSheet.create({
    titulo: { fontSize: 16, fontWeight: 'bold', color: colors.text, marginBottom: 4 },
    detalhe: { fontSize: 13, color: colors.textMuted },
});
