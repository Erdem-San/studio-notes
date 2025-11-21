import React from 'react';
import ReactDOM from 'react-dom/client';
import App from '../App';
import { waitForElement, createSidebarButton } from '../utils/dom';
import { ShadowRootProvider } from '../contexts/ShadowRootContext';
import indexCss from '../index.css?inline';

console.log('YouTube Studio Notes extension loading...');

// Create container for shadow DOM
const container = document.createElement('div');
container.id = 'stunote-container';
document.body.appendChild(container);

// Create shadow root for complete CSS isolation
const shadowRoot = container.attachShadow({ mode: 'open' });

// Create root element inside shadow DOM
const root = document.createElement('div');
root.id = 'stunote-root';
shadowRoot.appendChild(root);

// Inject CSS into shadow DOM
const style = document.createElement('style');
style.textContent = indexCss;
shadowRoot.appendChild(style);

// Render React app with Shadow Root context
ReactDOM.createRoot(root).render(
    <React.StrictMode>
        <ShadowRootProvider shadowRoot={shadowRoot}>
            <App />
        </ShadowRootProvider>
    </React.StrictMode>
);

// Inject Sidebar Button
const injectButton = async () => {
    const sidebarList = await waitForElement('#main-menu');

    if (document.getElementById('studio-notes-sidebar-btn')) return;

    const handleToggle = () => {
        const event = new CustomEvent('stunote-toggle');
        window.dispatchEvent(event);
    };

    const btn = createSidebarButton(handleToggle);
    sidebarList.appendChild(btn);
};

// Handle navigation changes (re-inject if needed)
const observer = new MutationObserver(() => {
    if (!document.getElementById('studio-notes-sidebar-btn')) {
        injectButton();
    }
});

waitForElement('#main-menu').then((menu) => {
    injectButton();
    observer.observe(menu, { childList: true, subtree: true });
});
