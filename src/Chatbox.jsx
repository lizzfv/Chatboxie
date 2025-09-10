// Chatbox.jsx — Single-file React component
// Solución al error "⚠️ Error: Failed to fetch":
// 1. Si usas modo directo (API NVIDIA), el navegador puede bloquear por CORS. Debes usar HTTPS y que tu key sea válida.
// 2. Si usas proxy (/api/chat), asegúrate de que el servidor Node está corriendo en http://localhost:3000 y que tu frontend apunta allí.
// He añadido manejo de CORS y mejor detección de errores para mostrar mensajes más claros.

import React, { useState, useRef, useEffect } from 'react';
import { SendHorizonal, Bot, User, KeyRound, Settings } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ChatboxNIM() {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: '¡Hola! Soy tu chat NIM. ¿En qué te ayudo hoy?' }
  ]);
  const [input, setInput] = useState('');
  const [model, setModel] = useState('meta/llama-3.1-8b-instruct');
  const [temperature, setTemperature] = useState(0.7);
  const [loading, setLoading] = useState(false);
  const [useDirect, setUseDirect] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const quickPrompts = [
    'Explícame como si tuviera 5 años',
    'Resume esto en 3 puntos',
    'Dame un ejemplo práctico',
    'Hazlo paso a paso'
  ];

  async function sendMessage() {
    const text = input.trim();
    if (!text || loading) return;
    setInput('');

    const next = [...messages, { role: 'user', content: text }];
    setMessages(next);
    setLoading(true);

    try {
      let url = '/api/chat';
      let headers = { 'Content-Type': 'application/json' };
      if (useDirect) {
        if (!apiKey.startsWith('nvapi-')) {
          throw new Error('Pega tu NVIDIA API key que comienza por nvapi-');
        }
        url = 'https://integrate.api.nvidia.com/v1/chat/completions';
        headers = { ...headers, Authorization: `Bearer ${apiKey}` };
      }

      const body = JSON.stringify({
        model,
        messages: next.map(m => ({ role: m.role, content: m.content })),
        temperature
      });

      const res = await fetch(url, { method: 'POST', headers, body });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Error HTTP ${res.status}: ${text}`);
      }
      const data = await res.json();
      const content = data?.choices?.[0]?.message?.content ?? '(sin respuesta)';
      setMessages(prev => [...prev, { role: 'assistant', content }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: `⚠️ Error de conexión: ${err.message}` }]);
    } finally {
      setLoading(false);
    }
  }

  function onKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-slate-50 text-slate-800">
      <div className="mx-auto max-w-5xl p-4 sm:p-6">
        {/* Header */}
        <div className="flex items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow">
              <Bot className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold leading-tight">Chatbox · NVIDIA NIM</h1>
              <p className="text-xs text-slate-500">Bonito, usable y listo para producción con proxy</p>
            </div>
          </div>
          <a className="text-xs underline hover:text-indigo-600" href="https://build.nvidia.com/explore/discover" target="_blank" rel="noreferrer">Catálogo de modelos</a>
        </div>

        {/* Card */}
        <div className="rounded-3xl bg-white/80 backdrop-blur shadow-xl ring-1 ring-black/5 overflow-hidden">
          {/* Controls */}
          <div className="border-b border-slate-100 p-4 sm:p-5">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* Model */}
              <div className="md:col-span-2">
                <label className="text-[11px] font-medium text-slate-600 flex items-center gap-1">
                  <Settings className="h-3.5 w-3.5" /> Modelo
                </label>
                <input
                  className="w-full mt-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                  value={model}
                  onChange={e => setModel(e.target.value)}
                  placeholder="meta/llama-3.1-8b-instruct"
                />
              </div>

              {/* Temperature */}
              <div>
                <label className="text-[11px] font-medium text-slate-600">Creatividad ({temperature})</label>
                <input
                  type="range"
                  min="0" max="1.5" step="0.1"
                  value={temperature}
                  onChange={e => setTemperature(parseFloat(e.target.value))}
                  className="w-full accent-indigo-600 mt-2"
                />
              </div>
            </div>

            {/* Direct API toggle + key */}
            <div className="mt-3 flex flex-col sm:flex-row sm:items-center gap-3">
              <label className="inline-flex items-center gap-2 text-sm select-none">
                <span className={"relative inline-flex h-6 w-11 items-center rounded-full transition " + (useDirect ? 'bg-emerald-500' : 'bg-slate-300')} onClick={() => setUseDirect(v => !v)}>
                  <span className={"inline-block h-5 w-5 transform rounded-full bg-white shadow transition " + (useDirect ? 'translate-x-5' : 'translate-x-1')} />
                </span>
                Usar API directa de NVIDIA (demo / no seguro)
              </label>

              {useDirect && (
                <div className="flex-1 flex items-center gap-2">
                  <div className="relative flex-1">
                    <KeyRound className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <input
                      className="w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                      placeholder="Pega tu nvapi-... (solo pruebas locales)"
                      value={apiKey}
                      onChange={e => setApiKey(e.target.value)}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Messages */}
          <div className="h-[55vh] overflow-y-auto p-4 sm:p-6 space-y-3 bg-gradient-to-b from-white/70 to-white" id="messages">
            <AnimatePresence initial={false}>
              {messages.map((m, i) => (
                <motion.div
                  key={i}
                  layout
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.15 }}
                  className={"flex items-start gap-3 " + (m.role === 'user' ? 'justify-end' : 'justify-start')}
                >
                  {m.role !== 'user' && (
                    <div className="mt-0.5 shrink-0 h-8 w-8 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow">
                      <Bot className="h-4 w-4" />
                    </div>
                  )}

                  <div className={(m.role === 'user' ? 'bg-indigo-600 text-white' : 'bg-white text-slate-800 border border-slate-200') + ' max-w-[78%] rounded-2xl px-4 py-2.5 shadow'}>
                    <div className="text-[11px] uppercase tracking-wide opacity-60 mb-1">{m.role}</div>
                    <div className="text-sm leading-relaxed whitespace-pre-wrap">{m.content}</div>
                  </div>

                  {m.role === 'user' && (
                    <div className="mt-0.5 shrink-0 h-8 w-8 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center">
                      <User className="h-4 w-4" />
                    </div>
                  )}
                </motion.div>
              ))}

              {loading && (
                <motion.div
                  key="typing"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center gap-2 text-slate-500 text-sm"
                >
                  <div className="h-2 w-2 rounded-full bg-slate-300 animate-bounce" />
                  <div className="h-2 w-2 rounded-full bg-slate-300 animate-bounce [animation-delay:100ms]" />
                  <div className="h-2 w-2 rounded-full bg-slate-300 animate-bounce [animation-delay:200ms]" />
                  <span className="ml-1">pensando…</span>
                </motion.div>
              )}
            </AnimatePresence>
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="border-t border-slate-100 p-3 sm:p-4">
            <div className="flex items-end gap-2 rounded-2xl border border-slate-200 bg-white p-2 shadow-sm">
              <textarea
                className="flex-1 resize-none rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                rows={2}
                placeholder="Escribe tu mensaje… (Enter para enviar, Shift+Enter = nueva línea)"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={onKeyDown}
              />
              <button
                onClick={sendMessage}
                disabled={loading || !input.trim()}
                className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow hover:bg-indigo-700 disabled:opacity-50"
                aria-label="Enviar"
              >
                <SendHorizonal className="h-4 w-4" />
                Enviar
              </button>
            </div>

            {/* Quick prompts */}
            <div className="mt-2 flex flex-wrap gap-2">
              {quickPrompts.map((q, idx) => (
                <button key={idx} onClick={() => setInput(q)} className="text-xs rounded-full border border-slate-200 px-3 py-1.5 hover:bg-slate-50">
                  {q}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/*
====================================================
 Node proxy (server.js) — RECOMENDADO PARA PRODUCCIÓN
====================================================

const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');
const app = express();

app.use(express.json());
app.use(cors()); // habilita CORS para que el frontend pueda llamar sin problemas

const API_URL = 'https://integrate.api.nvidia.com/v1/chat/completions';
const API_KEY = process.env.NVIDIA_API_KEY;

app.post('/api/chat', async (req, res) => {
  try {
    if (!API_KEY) return res.status(500).json({ error: 'Missing NVIDIA_API_KEY on server' });
    const { model, messages, temperature } = req.body || {};
    const r = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ model, messages, temperature })
    });
    const data = await r.json();
    res.status(r.status).json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.listen(3000, '0.0.0.0', () => console.log('Proxy listening on http://0.0.0.0:3000'));
*/

/*
=============================================
 FRONTEND — Vite + React (estructura completa)
=============================================

1) Crear proyecto
-----------------
# Desde la carpeta donde quieras tu frontend
npm create vite@latest ui -- --template react
cd ui
npm install

2) Proxy de desarrollo (para hablar con Node:3000)
--------------------------------------------------
// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': 'http://localhost:3000'
    }
  }
})

3) Componente principal que usa el chat
---------------------------------------
// src/App.jsx
import ChatboxNIM from './Chatbox'
export default function App() {
  return <ChatboxNIM />
}

4) Punto de entrada de React 18
-------------------------------
// src/main.jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)

5) HTML base
------------
// index.html
<!doctype html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Chat NIM</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>

6) Estilos mínimos (opcional)
-----------------------------
// src/index.css
* { box-sizing: border-box; }
body { margin: 0; font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, 'Helvetica Neue', Arial, 'Noto Sans', 'Apple Color Emoji', 'Segoe UI Emoji'; }

7) Poner el Chatbox.jsx
-----------------------
// Copia el contenido de Chatbox.jsx (arriba en este archivo) a ui/src/Chatbox.jsx

8) Ejecutar
-----------
# Ventana A (backend):
# dentro de /ruta/a/nim-chat donde está server.js
NVIDIA_API_KEY="nvapi-..." node server.js

# Ventana B (frontend):
# dentro de /ruta/a/ui
npm run dev
# Abre el enlace (p.ej. http://localhost:5173) y escribe un mensaje.
# Asegúrate de que el toggle "Usar API directa" está APAGADO para usar el proxy /api/chat.

9) Comprobación rápida
----------------------
- Si en la consola del navegador (DevTools > Network) `/api/chat` responde 200 y ves `choices` en el JSON, estás OK.
- Si sale 500 y dice `Missing NVIDIA_API_KEY on server` → arranca Node con la clave en la misma línea.
- Si ves CORS en local: revisa que llames a `/api/...` (no a `https://integrate...` desde el navegador) y que Vite proxy esté activo.

10) Build para servir estático (opcional)
----------------------------------------
# En ui/
npm run build
# Copia "ui/dist" a un servidor de estáticos (Nginx, Netlify, etc.).
# O sirve con el propio Vite:
npm run preview

*/

