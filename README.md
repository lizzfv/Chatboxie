# Chatbot NIM 

Un chatbot hecho en **React + Vite** que usa los modelos **NIM de NVIDIA** vía API.
https://chatboxie.vercel.app/
---

## Features
- UI moderna con Tailwind.
- Selector de modelo (por defecto `meta/llama-3.1-8b-instruct`).
- Slider de creatividad (temperature).
- Chips de prompts rápidos.
- Proxy seguro `/api/chat` para no exponer tu API key.

---

## Instalación local

```bash
# Clonar el repo
git clone https://github.com/lizzfv/Chatboxie.git
cd Chatboxie

# Instalar dependencias
npm install

# Arrancar backend + frontend
NVIDIA_API_KEY="nvapi-..." node server.js &
npm run dev
