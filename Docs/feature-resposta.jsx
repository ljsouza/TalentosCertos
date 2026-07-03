// feature-resposta.jsx — Filtro de Resposta Ativa (pergunta em áudio/vídeo de 30s)
const { useState: useStateR, useEffect: useEffectR, useRef } = React;

function ActiveResponseFilter({ vaga, onDone, onCancel }) {
  const f = vaga.filtroAtivo;
  const [fase, setFase] = useStateR("idle"); // idle | rec | done
  const [seg, setSeg] = useStateR(0);
  const timer = useRef(null);

  useEffectR(() => {
    if (fase === "rec") {
      timer.current = setInterval(() => setSeg((s) => {
        if (s >= 30) { clearInterval(timer.current); setFase("done"); return 30; }
        return s + 1;
      }), 1000);
    }
    return () => clearInterval(timer.current);
  }, [fase]);

  const fmt = (s) => `0:${String(s).padStart(2, "0")}`;
  const isVideo = f.formato === "video";

  return (
    <div className="arf">
      <div className="arf-head">
        <span className="ai-badge"><Icon name={isVideo ? "video" : "mic"} size={14} /> Filtro de resposta ativa</span>
        <button className="link" onClick={onCancel}>Cancelar</button>
      </div>
      <p className="arf-pergunta">“{f.pergunta}”</p>
      <p className="arf-sub">A empresa quer ouvir você, não só ler seu currículo. Responda em até <strong>30 segundos</strong> — sem ensaio, do seu jeito.</p>

      <div className={`arf-stage ${isVideo ? "video" : ""}`}>
        {isVideo && <div className="arf-cam">{fase === "rec" ? <span className="arf-cam-live">● REC</span> : <Icon name="video" size={28} />}<span className="arf-cam-label">{fase === "idle" ? "sua câmera aparece aqui" : fase === "rec" ? "gravando…" : "resposta gravada"}</span></div>}
        {!isVideo && (
          <div className="arf-wave" aria-hidden="true">
            {Array.from({ length: 28 }).map((_, i) => (
              <span key={i} className={fase === "rec" ? "live" : fase === "done" ? "full" : ""} style={{ animationDelay: `${i * 0.06}s`, height: `${20 + Math.abs(Math.sin(i * 1.7)) * 60}%` }} />
            ))}
          </div>
        )}
        <div className="arf-timer">
          <div className="arf-timer-bar"><span style={{ width: `${(seg / 30) * 100}%` }} /></div>
          <span className="arf-timer-num">{fmt(seg)} / 0:30</span>
        </div>
      </div>

      {fase === "idle" && (
        <button className="arf-rec-btn" onClick={() => { setSeg(0); setFase("rec"); }}>
          <span className="arf-dot" /> Gravar {isVideo ? "vídeo" : "áudio"}
        </button>
      )}
      {fase === "rec" && (
        <button className="arf-rec-btn recording" onClick={() => { clearInterval(timer.current); setFase("done"); }}>
          <span className="arf-square" /> Parar gravação
        </button>
      )}
      {fase === "done" && (
        <div className="arf-done">
          <div className="arf-preview"><Icon name="play" size={16} /> Sua resposta · {fmt(seg)}</div>
          <div className="arf-done-acts">
            <Btn variant="ghost" onClick={() => { setSeg(0); setFase("idle"); }}>Regravar</Btn>
            <Btn icon="check" onClick={onDone}>Enviar candidatura</Btn>
          </div>
        </div>
      )}
      <p className="arf-note"><Icon name="shield" size={13} /> Só a empresa desta vaga ouve sua resposta. No protótipo, a gravação é simulada.</p>
    </div>
  );
}

Object.assign(window, { ActiveResponseFilter });
