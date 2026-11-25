import { useState } from 'react';
import Layout from '../../../shared/layout';
import CabecalhoPesquisa from './cabecalhoPesquisa';
import ItemLista from './itemLista';
import { Text } from 'react-native';
import { colors } from '../../../styles/colors';

type Item = { rotulo: string; onPress?: () => void; indisponivel?: boolean };

type ListaPesquisavelProps = {
    titulo: string;
    itens: Item[];
};

export default function ListaPesquisavel({ titulo, itens }: ListaPesquisavelProps) {
    const [aberto, setAberto] = useState(false);
    const [termo, setTermo] = useState('');

    const filtrados = itens.filter((item) =>
        item.rotulo.toLowerCase().includes(termo.trim().toLowerCase()),
    );

    function alternarPesquisa() {
        setAberto((atual) => !atual);
        setTermo('');
    }

    return (
        <Layout comHeader={false} voltar>
            <CabecalhoPesquisa
                titulo={titulo}
                aberto={aberto}
                termo={termo}
                onAlternar={alternarPesquisa}
                onChangeTermo={setTermo}
            />
            {filtrados.map((item) => (
                <ItemLista key={item.rotulo} rotulo={item.indisponivel ? `${item.rotulo} — indisponível` : item.rotulo} onPress={item.onPress} />
            ))}
            {filtrados.length === 0 ? <Text style={{ color: colors.textMuted }}>Nenhum resultado encontrado.</Text> : null}
        </Layout>
    );
}
