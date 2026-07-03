"use client";
import { useState } from "react";
import { Icon } from "@/components/Icon";

// Aceita qualquer coisa compartilhável (vaga, post da Tribuna…).
type Shareable = { id: string; titulo: string; cidade: string | null };

export function ShareMenu({ vaga, up = false, path = "/vaga" }: { vaga: Shareable; up?: boolean; path?: string }) {
  const [open, setOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const url = `https://maringapost.com.br/empregos${path}/${vaga.id}`;
  const text = `${vaga.titulo} em ${vaga.cidade} — MaringáPost Empregos`;
  const enc = encodeURIComponent;

  const nets = [
    { id: "whatsapp", label: "WhatsApp", color: "#25D366", href: `https://wa.me/?text=${enc(text + "\n" + url)}` },
    { id: "facebook", label: "Facebook", color: "#1877F2", href: `https://www.facebook.com/sharer/sharer.php?u=${enc(url)}` },
    { id: "xtwitter", label: "X", color: "#000", href: `https://twitter.com/intent/tweet?text=${enc(text)}&url=${enc(url)}` },
    { id: "linkedin", label: "LinkedIn", color: "#0A66C2", href: `https://www.linkedin.com/sharing/share-offsite/?url=${enc(url)}` },
    { id: "telegram", label: "Telegram", color: "#26A5E4", href: `https://t.me/share/url?url=${enc(url)}&text=${enc(text)}` },
    { id: "instagram", label: "Instagram", color: "#E1306C", href: null as string | null },
  ];

  const doToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 2500); };

  const copyLink = () => {
    navigator.clipboard.writeText(url).then(() => doToast("Link copiado!")).catch(() => doToast("Copie: " + url));
    setOpen(false);
  };

  const handleNet = (net: (typeof nets)[number]) => {
    if (net.href) window.open(net.href, "_blank", "noopener,noreferrer");
    else navigator.clipboard.writeText(url).then(() => doToast("Link copiado! Cole no Instagram.")).catch(() => doToast("Copie: " + url));
    setOpen(false);
  };

  return (
    <div className="share-wrap" onClick={(ev) => ev.stopPropagation()}>
      <button className="icon-btn" onClick={() => setOpen((o) => !o)} aria-label="Compartilhar vaga" title="Compartilhar">
        <Icon name="share" size={18} />
      </button>
      {toast && <div className="share-toast">{toast}</div>}
      {open && (
        <>
          <div className="share-backdrop" onClick={() => setOpen(false)} />
          <div className={`share-menu${up ? " up" : ""}`}>
            <p className="share-menu-label">Compartilhar vaga</p>
            <div className="share-nets">
              {nets.map((nNet) => (
                <button key={nNet.id} className="share-net" onClick={() => handleNet(nNet)} title={nNet.label} style={{ ["--sn-color" as string]: nNet.color }}>
                  <span className="sn-icon"><Icon name={nNet.id} size={20} /></span>
                  <span className="sn-label">{nNet.label}</span>
                </button>
              ))}
            </div>
            <button className="share-copy-row" onClick={copyLink}>
              <Icon name="link" size={15} />
              <span>Copiar link</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
}
