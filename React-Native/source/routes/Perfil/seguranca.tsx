import { useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity } from 'react-native';
import Layout from '../../shared/layout';
import { mensagemDeErro } from '../../services/api';
import { alterarSenha } from '../../services/senha';
import { colors } from '../../styles/colors';
import ListaPesquisavel from './components/listaPesquisavel';

export default function Seguranca() {
    const [editando, setEditando] = useState(false);
    const [atual, setAtual] = useState('');
    const [nova, setNova] = useState('');
    const [confirmacao, setConfirmacao] = useState('');
    const [salvando, setSalvando] = useState(false);

    function fechar() {
        setAtual('');
        setNova('');
        setConfirmacao('');
        setEditando(false);
    }

    async function salvar() {
        if (salvando) return;
        if (!atual.trim() || !nova.trim() || nova.length < 8 || nova !== confirmacao) {
            Alert.alert('Confira os dados', 'Informe a senha atual e uma nova senha de pelo menos 8 caracteres, com confirmação igual.');
            return;
        }
        setSalvando(true);
        try {
            await alterarSenha(atual, nova);
            fechar();
            Alert.alert('Senha alterada', 'Sua senha foi alterada. Sessões existentes permanecem ativas.');
        } catch (erro) {
            const mensagem = erro instanceof Error && (erro.message === 'HTTP 400' || erro.message === 'Bad Request')
                ? 'Confira a senha atual e use uma nova senha de até 72 bytes.' : mensagemDeErro(erro);
            Alert.alert('Não foi possível alterar a senha', mensagem);
        } finally {
            setSalvando(false);
        }
    }

    if (editando) {
        return (
            <Layout comHeader={false}>
                <Text style={styles.titulo}>Alterar senha</Text>
                {[
                    { label: 'Senha atual', value: atual, change: setAtual },
                    { label: 'Nova senha', value: nova, change: setNova },
                    { label: 'Confirmar nova senha', value: confirmacao, change: setConfirmacao },
                ].map((campo) => (
                    <TextInput key={campo.label} style={styles.campo} placeholder={campo.label}
                        placeholderTextColor={colors.textMuted} accessibilityLabel={campo.label}
                        secureTextEntry autoCapitalize="none" autoCorrect={false} value={campo.value}
                        onChangeText={campo.change} editable={!salvando} />
                ))}
                <TouchableOpacity style={styles.botao} onPress={salvar} disabled={salvando} accessibilityRole="button">
                    <Text style={styles.botaoTexto}>{salvando ? 'Salvando...' : 'Salvar'}</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={fechar} disabled={salvando} accessibilityRole="button">
                    <Text style={styles.cancelar}>Cancelar</Text>
                </TouchableOpacity>
            </Layout>
        );
    }

    return <ListaPesquisavel titulo="Segurança" itens={[
        { rotulo: 'Alterar senha', onPress: () => setEditando(true) },
        { rotulo: 'Alterar email', indisponivel: true },
        { rotulo: 'Alterar número', indisponivel: true },
        { rotulo: 'Políticas de privacidade' },
    ]} />;
}

const styles = StyleSheet.create({
    titulo: { fontSize: 22, fontWeight: 'bold', color: colors.text, marginBottom: 16 },
    campo: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 8, color: colors.text, padding: 12, marginBottom: 12 },
    botao: { backgroundColor: colors.primary, borderRadius: 8, padding: 12, alignItems: 'center' },
    botaoTexto: { color: colors.onPrimary, fontWeight: 'bold' },
    cancelar: { color: colors.primary, textAlign: 'center', padding: 12 },
});
