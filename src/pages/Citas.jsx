// src/pages/Citas.jsx
import { useState, useEffect } from 'react';
import { DayPicker } from 'react-day-picker';
import { es } from 'date-fns/locale';
import 'react-day-picker/dist/style.css';
import { api } from '../lib/api';

function formatFecha(fecha) {
  return new Date(fecha + 'T00:00:00').toLocaleDateString('es-ES', {
    weekday: 'long', day: 'numeric', month: 'long',
  });
}

const ESTADO_ESTILOS = {
  pendiente:  'bg-amber-100 text-amber-700',
  confirmada: 'bg-teal-100 text-teal-700',
  cancelada:  'bg-red-100 text-red-600',
  completada: 'bg-stone-100 text-stone-500',
};

// ... (resto de tus importaciones)

export default function Citas() {
  // ... (tus estados)

  // 1. Calculamos el límite (Ahora + 2 horas)
  const limiteReserva = new Date(Date.now() + 2 * 60 * 60 * 1000);

  // ... (tus funciones cargarDatos, reservar, cancelarCita)

  return (
    <div className="sm:pl-52 pb-24 max-w-2xl p-4">
      {/* ... (título y calendario) */}

      <section className="mb-10">
        <h2 className="text-base font-semibold text-stone-700 mb-4">
          Huecos para el {diaSeleccionado?.toLocaleDateString('es-ES', { day: 'numeric', month: 'long' })}
        </h2>
        
        <div className="flex flex-wrap gap-2">
          {huecos.filter(h => {
            const year = diaSeleccionado.getFullYear();
            const month = String(diaSeleccionado.getMonth() + 1).padStart(2, '0');
            const day = String(diaSeleccionado.getDate()).padStart(2, '0');
            return h.fecha === `${year}-${month}-${day}`;
          }).length === 0 ? (
            <p className="text-sm text-stone-400">No hay huecos este día.</p>
          ) : (
            huecos.filter(h => {
              const year = diaSeleccionado.getFullYear();
              const month = String(diaSeleccionado.getMonth() + 1).padStart(2, '0');
              const day = String(diaSeleccionado.getDate()).padStart(2, '0');
              return h.fecha === `${year}-${month}-${day}`;
            }).map((h) => {
              // 2. Comprobamos si el hueco es menor al límite de 2 horas
              const fechaHueco = new Date(`${h.fecha}T${h.hora_inicio}`);
              const esPasadoOProximo = fechaHueco < limiteReserva;

              return (
                <button
                  key={h.id}
                  disabled={esPasadoOProximo} // Deshabilita la selección
                  onClick={() => setSeleccionado(seleccionado?.id === h.id ? null : h)}
                  className={`px-4 py-2 rounded-lg text-sm border transition font-medium ${
                    esPasadoOProximo 
                      ? 'bg-stone-100 text-stone-400 border-stone-200 cursor-not-allowed' // Estilo bloqueado
                      : seleccionado?.id === h.id 
                        ? 'bg-teal-600 text-white' 
                        : 'border-stone-300 text-stone-700 hover:border-teal-400'
                  }`}
                >
                  {h.hora_inicio.slice(0, 5)}
                </button>
              );
            })
          )}
        </div>

        {/* ... (el formulario de reserva se mantiene igual) */}
      </section>
      
      {/* ... (sección de tus citas) */}
    </div>
  );
}