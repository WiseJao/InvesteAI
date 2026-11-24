import { Text, StyleSheet } from 'react-native';
import Layout from '../../shared/layout';
import Card from '../../shared/card';
import Estado from '../../shared/estado';
import { useCarregar } from '../../shared/useCarregar';
import { listarRecomendacoes, obterPerfilInvestidor } from '../../services/assessoria';
import { colors } from '../../styles/colors';

async function carregar() {
    const [perfil, itens] = await Promise.all([obterPerfilInvestidor(), listarRecomendacoes()]);
    return { perfil, itens };
}

export default function Recomendacoes() {
    const { dados, carregando, erro, recarregar } = useCarregar(carregar);

    return (
        <Layout
            titulo="Recomendações"
            subtitulo={dados ? `Baseado no seu perfil ${dados.perfil.perfil}` : undefined}
            voltar
        >
            <Estado carregando={carregando} erro={erro} temDados={dados !== null} onTentarNovamente={recarregar}>
                {(dados?.itens ?? []).map((item) => (
                    <Card key={item.simbolo}>
                        <Text style={styles.titulo}>{item.titulo}</Text>
                        <Text style={styles.descricao}>{item.descricao}</Text>
                        <Text style={styles.detalhe}>
                            {item.categoria} · Risco {item.risco.toLowerCase()}
                        </Text>
                        <Text style={styles.detalhe}>
                            Retorno esperado: {item.retornoEsperado} · Aporte mínimo: {item.aporteMinimo}
                        </Text>
                    </Card>
                ))}
            </Estado>
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
        marginBottom: 6,
    },
    detalhe: {
        fontSize: 11,
        color: colors.textMuted,
        marginTop: 2,
    },
});
