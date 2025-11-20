import React from 'react';
import ReactDOM from 'react-dom/client';
import App from '../App';
import '../index.css';
import { waitForElement, createSidebarButton } from '../utils/dom';

console.log('YouTube Studio Notes extension loading...');

// Mount React App
const root = document.createElement('div');
root.id = 'stunote-root';
root.style.position = 'absolute';
root.style.top = '0';
root.style.left = '0';
root.style.width = '0';
root.style.height = '0';
root.style.zIndex = '9999';
document.body.appendChild(root);

ReactDOM.createRoot(root).render(
    <React.StrictMode>
        <App />
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
