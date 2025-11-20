import React, { useEffect, useState } from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Notebook } from 'lucide-react'

function Popup() {
    const [isEnabled, setIsEnabled] = useState(true);

    useEffect(() => {
        chrome.storage.local.get("extensionEnabled", (data) => {
            // Varsayılan true
            if (data.extensionEnabled === undefined) {
                setIsEnabled(true);
            } else {
                setIsEnabled(Boolean(data.extensionEnabled));
            }
        });
    }, []);

    const handleToggle = (checked: boolean) => {
        setIsEnabled(checked);

        // 1. Ayarı kaydet
        chrome.storage.local.set({ extensionEnabled: checked });

        // 2. İKONU DEĞİŞTİR (Kilit Nokta Burası)
        if (checked) {
            // AÇIKSA: Renkli ikon ve normal badge
            chrome.action.setIcon({ path: "icon-128.png" }); // Renkli ikon yolun
            chrome.action.setBadgeText({ text: "" }); // Yazıyı temizle
        } else {
            // KAPALIYSA: Gri ikon veya üzerine "OFF" yazısı
            // Seçenek A: Gri İkonun varsa:
            // chrome.action.setIcon({ path: "icon-128-gray.png" });

            // Seçenek B (Daha Kolay): İkonun üzerine "OFF" yazısı ekle ve grileştir
            chrome.action.setIcon({ path: "icon-128.png" }); // İkon kalsın ama...
            chrome.action.setBadgeText({ text: "OFF" });      // Üzerine OFF yaz
            chrome.action.setBadgeBackgroundColor({ color: "#555555" }); // Gri zemin
        }
    };

    return (
        <div className="flex flex-col w-full h-full bg-[#0f0f0f] text-white border border-[#303030] font-roboto p-6">

            <div className="flex items-center gap-3 mb-6 border-b border-[#303030] pb-4">
                <div className="p-2 bg-[#202020] rounded-lg">
                    <Notebook className="w-5 h-5 text-white" />
                </div>
                <div>
                    <h1 className="text-lg font-medium leading-none">Studio Notes</h1>
                    <p className="text-xs text-[#888] mt-1">Hızlı Erişim Paneli</p>
                </div>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-[#1a1a1a] border border-[#303030]">
                <Label htmlFor="mode" className="text-sm font-medium text-gray-300 cursor-pointer">
                    {isEnabled ? 'Uzantı Etkin' : 'Devre Dışı'}
                </Label>

                <Switch
                    id="mode"
                    checked={isEnabled}
                    onCheckedChange={handleToggle}
                    className="data-[state=checked]:bg-green-600 data-[state=unchecked]:bg-[#303030]"
                />
            </div>

            {/* Kullanıcıya bilgi vermek için ufak bir not */}
            {!isEnabled && (
                <div className="mt-4 text-xs text-center text-gray-500">
                    Uzantı şu an tamamen kapalı. Açmak için anahtarı kullanın.
                </div>
            )}

        </div>
    )
}

ReactDOM.createRoot(document.getElementById('popup-root')!).render(
    <React.StrictMode>
        <Popup />
    </React.StrictMode>,
)