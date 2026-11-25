import { createContext, useContext, useState, type ReactNode } from 'react';

const PrivacidadeContext = createContext({ oculto: false, alternar: () => {} });

export function PrivacidadeProvider({ children }: { children: ReactNode }) {
    const [oculto, setOculto] = useState(false);
    return <PrivacidadeContext.Provider value={{ oculto, alternar: () => setOculto((valor) => !valor) }}>{children}</PrivacidadeContext.Provider>;
}

export function usePrivacidade() {
    return useContext(PrivacidadeContext);
}