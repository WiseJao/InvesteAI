import { useState } from 'react';
import Layout from '../../../shared/layout';
import CabecalhoPesquisa from './cabecalhoPesquisa';
import ItemLista from './itemLista';

type ListaPesquisavelProps = {
    titulo: string;
    itens: string[];
};

export default function ListaPesquisavel({ titulo, itens }: ListaPesquisavelProps) {
    const [aberto, setAberto] = useState(false);
    const [termo, setTermo] = useState('');

    const filtrados = itens.filter((item) =>
        item.toLowerCase().includes(termo.trim().toLowerCase()),
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
            {/* TODO: cada item vai abrir a sua tela quando elas existirem */}
            {filtrados.map((item) => (
                <ItemLista key={item} rotulo={item} />
            ))}
        </Layout>
    );
}
