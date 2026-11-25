import { useState } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import Layout from '../../shared/layout';
import Card from '../../shared/card';
import Estado from '../../shared/estado';
import { useCarregar } from '../../shared/useCarregar';
import { getAvatar, logout } from '../../services/api';
import { limparUsuario, obterUsuario, type Usuario } from '../../services/usuario';
import { obterCarteira } from '../../services/carteira';
import { listarObjetivos } from '../../services/objetivos';
import { formatarReais } from '../../shared/currency';
import { colors } from '../../styles/colors';
import type { HomeStackParamList } from '../Home/types';
import CabecalhoPesquisa from './components/cabecalhoPesquisa';
import ItemLista from './components/itemLista';

type Item = {
    rotulo: string;
    rota?: 'EditarPerfil' | 'Seguranca' | 'Configuracoes' | 'FAQ';
    sair?: boolean;
};

function formatarCpf(cpf: string): string {
    const numeros = cpf.replace(/\D/g, '');
    return numeros.length === 11
        ? `${numeros.slice(0, 3)}.${numeros.slice(3, 6)}.${numeros.slice(6, 9)}-${numeros.slice(9)}`
        : cpf;
}

function montarItens(usuario: Usuario | null): Item[] {
    return [
        { rotulo: `Nome: ${usuario?.nome || '—'}` },
        { rotulo: `Email: ${usuario?.email ?? '—'}` },
        { rotulo: `CPF: ${usuario ? formatarCpf(usuario.cpf) : '—'}` },
        { rotulo: 'Editar perfil e renda mensal', rota: 'EditarPerfil' },
        { rotulo: 'Senha e segurança', rota: 'Seguranca' },
        { rotulo: 'Privacidade e configurações', rota: 'Configuracoes' },
        { rotulo: 'FAQ', rota: 'FAQ' },
        { rotulo: `Renda mensal: ${usuario?.renda != null ? formatarReais(usuario.renda) : '—'}` },
        { rotulo: 'Sair da conta', sair: true },
    ];
}

export default function Perfil() {
    const navigation = useNavigation<NativeStackNavigationProp<HomeStackParamList>>();
    const [aberto, setAberto] = useState(false);
    const [termo, setTermo] = useState('');
    const { dados: usuario, erro, carregando, recarregar } = useCarregar(obterUsuario);
    const carteira = useCarregar(obterCarteira);
    const objetivos = useCarregar(listarObjetivos);
    const { dados: avatar, erro: erroAvatar } = useCarregar(getAvatar);
    const [imagemComErro, setImagemComErro] = useState<string | null>(null);

    async function sair() {
        await logout();
        limparUsuario();
    }

    const filtrados = montarItens(usuario).filter((item) =>
        item.rotulo.toLowerCase().includes(termo.trim().toLowerCase()),
    );

    function alternarPesquisa() {
        setAberto((atual) => !atual);
        setTermo('');
    }

    return (
        <Layout comHeader={false} voltar>
            <CabecalhoPesquisa
                titulo="Perfil"
                aberto={aberto}
                termo={termo}
                onAlternar={alternarPesquisa}
                onChangeTermo={setTermo}
            />

            <Estado carregando={carregando} erro={erro} temDados={usuario !== null} onTentarNovamente={recarregar}>
                <View style={styles.identidade}>
                    <View style={styles.avatar}>
                        {avatar && imagemComErro !== avatar ? (
                            <Image source={{ uri: avatar }} style={styles.avatarImagem} onError={() => setImagemComErro(avatar)} />
                        ) : <Ionicons name="person" size={56} color={colors.textMuted} />}
                    </View>
                    <Text style={styles.nome}>{usuario?.nome ?? '—'}</Text>
                    {erroAvatar ? <Text style={styles.avisoFoto}>Foto indisponível.</Text> : null}
                    <View style={styles.contadores}>
                        <View style={styles.contador}>
                            <Text style={styles.contadorValor}>{carteira.dados?.ativos.length ?? '—'}</Text>
                            <Text style={styles.contadorRotulo}>investimentos</Text>
                        </View>
                        <View style={styles.divisor} />
                        <View style={styles.contador}>
                            <Text style={styles.contadorValor}>{objetivos.dados?.length ?? '—'}</Text>
                            <Text style={styles.contadorRotulo}>objetivos</Text>
                        </View>
                    </View>
                </View>

            </Estado>
            {filtrados.length ? <Card>{filtrados.map((item) => (
                <ItemLista
                    key={item.rotulo}
                    rotulo={item.rotulo}
                    onPress={item.sair ? sair : item.rota ? () => navigation.navigate(item.rota!) : undefined}
                />
            ))}</Card> : <Text style={styles.avisoFoto}>Nenhum item encontrado.</Text>}
        </Layout>
    );
}

const styles = StyleSheet.create({
    identidade: {
        alignItems: 'center',
        gap: 8,
    },
    avatar: {
        width: 110,
        height: 110,
        borderRadius: 55,
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
    },
    avatarImagem: {
        width: '100%',
        height: '100%',
    },
    avisoFoto: {
        color: colors.textMuted,
        fontSize: 13,
        marginTop: 6,
    },
    nome: {
        fontSize: 16,
        color: colors.text,
        marginTop: 10,
    },
    contadores: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 10,
    },
    contador: {
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    contadorValor: {
        fontSize: 14,
        fontWeight: 'bold',
        color: colors.text,
    },
    contadorRotulo: {
        fontSize: 10,
        color: colors.textMuted,
    },
    divisor: {
        width: 1,
        height: 28,
        backgroundColor: colors.border,
    },
});
