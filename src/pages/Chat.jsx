// src/pages/Chat.jsx
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';
import OriCharacter from '../components/OriCharacter';

function formatHora(fecha) {
  return new Date(fecha).toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function Chat() {
  const { user } = useAuth();
  const [mensajes, setMensajes] = useState([]);
  const [input, setInput] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [cargando, setCargando] = useState(true);
  const [estadoOri, setEstadoOri] = useState('neutral');
  const [mensajeActual, setMensajeActual] = useState('');
  const chatEndRef = useRef(null);

  // Cargar historial al montar
  useEffect(() => {
    async function cargarHistorial() {
      try {
        const res = await api.get('/chat/historial');
        setMensajes(res.mensajes || []);
      } catch (err) {
        console.error('Error al cargar historial:', err);
      } finally {
        setCargando(false);
      }
    }
    cargarHistorial();
  }, []);

  // Auto-scroll
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [mensajes, mensajeActual]);

  // Efecto máquina de escribir para la última respuesta
  useEffect(() => {
    if (!mensajeActual) return;
    setEstadoOri('talking');
    const timeout = setTimeout(() => {
      setMensajes(prev => {
        const last = prev[prev.length - 1];
        if (last?.autor === 'ia' && last.texto === mensajeActual + '...') {
          const updated = [...prev];
          updated[updated.length - 1] = { ...last, texto: mensajeActual };
          return updated;
        }
        return prev;
      });
      setMensajeActual('');
      setEstadoOri('neutral');
    }, mensajeActual.length * 15 + 500);

    return () => clearTimeout(timeout);
  }, [mensajeActual]);

  const enviarMensaje = async () => {
    const texto = input.trim();
    if (!texto || enviando || !user) return;

    setInput('');
    setEnviando(true);
    setEstadoOri('listening');

    // Añadir mensaje del usuario inmediatamente
    const msgUsuario = { id: Date.now(), autor: 'usuario', texto, creado_en: new Date().toISOString() };
    setMensajes(prev => [...prev, msgUsuario]);

    try {
      setEstadoOri('thinking');

      // Enviamos solo los mensajes relevantes (sin etiquetas de rol duplicadas)
      const historial = mensajes.slice(-8).map(m => ({
        role: m.autor === 'usuario' ? 'user' : 'assistant',
        content: m.texto,
      }));

      const res = await api.post('/chat', {
        mensaje: texto,
        historial,
      });

      // Mostrar con efecto máquina de escribir
      const respuestaParcial = res.respuesta + '...';
      setMensajes(prev => [...prev, {
        id: Date.now() + 1,
        autor: 'ia',
        texto: respuestaParcial,
        creado_en: new Date().toISOString(),
      }]);
      setMensajeActual(res.respuesta);
    } catch (err) {
      const errorMsg = err.message || 'Error al conectar con la IA.';
      setMensajes(prev => [...prev, {
        id: Date.now() + 1,
        autor: 'sistema',
        texto: '⚠️ ' + errorMsg,
        creado_en: new Date().toISOString(),
      }]);
      setEstadoOri('neutral');
    } finally {
      setEnviando(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      enviarMensaje();
    }
  };

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8">
        <OriCharacter estado="neutral" tamaño="lg" />
        <h2 className="text-2xl font-bold text-stone-800 mt-6">Chat de apoyo 24h</h2>
        <p className="text-stone-500 mt-2 mb-6">Inicia sesión para poder conversar con Ori, tu asistente de orientación.</p>
        <a href="/login" className="bg-teal-600 text-white px-8 py-3 rounded-full hover:bg-teal-700 transition">
          Iniciar sesión
        </a>
      </div>
    );
  }

  if (cargando) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="animate-pulse flex flex-col items-center">
          <OriCharacter estado="neutral" tamaño="md" />
          <p className="text-stone-400 text-sm mt-4">Cargando conversación...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto pb-28">
      {/* Encabezado con Ori */}
      <div className="text-center mb-6">
        <div className="flex justify-center mb-2">
          <OriCharacter
            estado={
              estadoOri === 'thinking' ? 'thinking' :
              estadoOri === 'talking' ? 'talking' :
              estadoOri === 'listening' ? 'listening' : 'neutral'
            }
            tamaño="lg"
          />
        </div>
        <h1 className="text-2xl font-bold text-stone-800">Ori</h1>
        <p className="text-sm text-stone-500">Tu asistente de orientación psicoeducativa</p>
        {estadoOri === 'thinking' && (
          <span className="inline-block mt-2 text-xs bg-amber-100 text-amber-700 px-3 py-1 rounded-full animate-pulse">
            Pensando...
          </span>
        )}
      </div>

      {/* Mensajes */}
      <div className="bg-white rounded-2xl border border-stone-200 p-4 mb-4 max-h-[55vh] overflow-y-auto space-y-4">
        {mensajes.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-stone-400 text-sm">
              ¡Hola! Soy Ori. ¿En qué te gustaría reflexionar hoy?
              <br />
              Puedes contarme lo que te preocupa, preguntarme sobre desarrollo infantil
              o simplemente explorar tus pensamientos.
            </p>
          </div>
        ) : (
          mensajes.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.autor === 'usuario' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                  msg.autor === 'usuario'
                    ? 'bg-teal-600 text-white rounded-br-md'
                    : msg.autor === 'sistema'
                      ? 'bg-red-50 text-red-700 border border-red-200'
                      : 'bg-stone-100 text-stone-700 rounded-bl-md'
                }`}
              >
                <p>{msg.texto}</p>
                <p className={`text-xs mt-1 ${
                  msg.autor === 'usuario' ? 'text-teal-200' : 'text-stone-400'
                }`}>
                  {formatHora(msg.creado_en)}
                </p>
              </div>
            </div>
          ))
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Input */}
      <div className="bg-white border border-stone-200 rounded-2xl p-2 flex items-center gap-2">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Escribe tu mensaje aquí..."
          rows={1}
          className="flex-1 border-0 outline-none resize-none p-2 text-sm focus:ring-0"
          disabled={enviando}
        />
        <button
          onClick={enviarMensaje}
          disabled={!input.trim() || enviando}
          className={`px-5 py-2.5 rounded-xl text-sm font-medium transition ${
            !input.trim() || enviando
              ? 'bg-stone-200 text-stone-400 cursor-not-allowed'
              : 'bg-teal-600 text-white hover:bg-teal-700'
          }`}
        >
          {enviando ? (
            <span className="flex items-center gap-1">
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
              Enviando
            </span>
          ) : 'Enviar'}
        </button>
      </div>

      {/* Disclaimer */}
      <div className="mt-4 text-center">
        <div className="inline-flex items-center gap-1.5 bg-amber-50 border border-amber-200 rounded-full px-4 py-1.5 text-xs text-amber-700">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M12 2a10 10 0 100 20 10 10 0 000-20z" />
          </svg>
          <span>
            <strong>IA ·</strong> Ori está potenciado por inteligencia artificial.
            Todo lo que compartas aquí podrá ser utilizado en terapia para conocerte mejor.
          </span>
        </div>
      </div>
    </div>
  );
}
