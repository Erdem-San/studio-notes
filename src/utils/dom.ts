export const createSidebarButton = (onClick: () => void) => {
    const li = document.createElement('li');
    li.role = 'presentation';
    li.className = 'style-scope ytcp-navigation-drawer';
    li.id = 'studio-notes-sidebar-btn';

    li.innerHTML = `
    <ytcp-ve track-click="" class="style-scope ytcp-navigation-drawer" role="none">
              <a class="menu-item-link style-scope ytcp-navigation-drawer" role="menuitem" id="menu-item-0" aria-current="page" href="javascript:void(0)">
        <div style="display: flex; align-items: center; padding: 0 24px; height: 48px; cursor: pointer;">
            
        <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 24px; color: #fff;">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
            <line x1="16" y1="13" x2="8" y2="13"></line>
            <line x1="16" y1="17" x2="8" y2="17"></line>
            <polyline points="10 9 9 9 8 9"></polyline>
        </svg>
    
            <span style="font-family: 'Roboto','Noto',sans-serif; font-size: 15px; font-weight: 500; color: #fff; white-space: nowrap;">Notes</span>
        </div>
    </a>
    </ytcp-ve>
  `;

    li.addEventListener('click', (e) => {
        e.preventDefault();
        onClick();
    });

    return li;
};

export const waitForElement = (selector: string): Promise<Element> => {
    return new Promise((resolve) => {
        if (document.querySelector(selector)) {
            return resolve(document.querySelector(selector)!);
        }

        const observer = new MutationObserver(() => {
            if (document.querySelector(selector)) {
                resolve(document.querySelector(selector)!);
                observer.disconnect();
            }
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true,
        });
    });
};
