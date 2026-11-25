import type { NavigatorScreenParams } from '@react-navigation/native';
import type { AIStackParamList } from './AI/types';
import type { GastosStackParamList } from './Gastos/types';
import type { HomeStackParamList } from './Home/types';
import type { InvestimentosStackParamList } from './Investimentos/types';

export type AbasParamList = {
    Home: NavigatorScreenParams<HomeStackParamList> | undefined;
    Investimentos: NavigatorScreenParams<InvestimentosStackParamList> | undefined;
    Gastos: NavigatorScreenParams<GastosStackParamList> | undefined;
    AI: NavigatorScreenParams<AIStackParamList> | undefined;
};

export type RootStackParamList = {
    Login: undefined;
    Cadastro: undefined;
    EsqueciSenha: undefined;
    Main: undefined;
};
