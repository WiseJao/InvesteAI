import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { obterUsuario } from '../services/usuario';

type Preferences = { hideOnStart: boolean; opaqueTabs: boolean };
const defaults: Preferences = { hideOnStart: false, opaqueTabs: false };
const PrivacidadeContext = createContext({
    oculto: false, alternar: () => {}, preferences: defaults,
    savePreferences: async (_next: Preferences) => {}, ready: false,
});

export function PrivacidadeProvider({ children }: { children: ReactNode }) {
    const [oculto, setOculto] = useState(false);
    const [preferences, setPreferences] = useState(defaults);
    const [key, setKey] = useState<string | null>(null);

    useEffect(() => {
        let active = true;
        void obterUsuario().then(async user => {
            const storageKey = 'investeai.preferences.' + user.id;
            const raw = await AsyncStorage.getItem(storageKey);
            if (!active) return;
            const saved = raw ? JSON.parse(raw) : defaults;
            setPreferences({ hideOnStart: saved.hideOnStart === true, opaqueTabs: saved.opaqueTabs === true });
            setOculto(saved.hideOnStart === true);
            setKey(storageKey);
        }).catch(() => {});
        return () => { active = false; };
    }, []);

    async function savePreferences(next: Preferences) {
        if (!key) throw new Error('Preferências indisponíveis.');
        await AsyncStorage.setItem(key, JSON.stringify(next));
        setPreferences(next);
    }

    return <PrivacidadeContext.Provider value={{ oculto, alternar: () => setOculto(v => !v), preferences, savePreferences, ready: key !== null }}>
        {children}
    </PrivacidadeContext.Provider>;
}

export function usePrivacidade() {
    return useContext(PrivacidadeContext);
}
