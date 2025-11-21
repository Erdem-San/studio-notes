import React, { createContext, useContext } from 'react';

interface ShadowRootContextType {
    shadowRoot: ShadowRoot | null;
}

const ShadowRootContext = createContext<ShadowRootContextType>({ shadowRoot: null });

export const ShadowRootProvider: React.FC<{ shadowRoot: ShadowRoot; children: React.ReactNode }> = ({ shadowRoot, children }) => {
    return (
        <ShadowRootContext.Provider value={{ shadowRoot }}>
            {children}
        </ShadowRootContext.Provider>
    );
};

export const useShadowRoot = () => {
    const context = useContext(ShadowRootContext);
    return context.shadowRoot;
};
