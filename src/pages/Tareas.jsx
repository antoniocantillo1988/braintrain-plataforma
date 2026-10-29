// src/pages/Tareas.jsx
import { ClipboardList } from 'lucide-react';

export default function Tareas() {
  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="font-serif text-3xl font-bold text-tierra-800">Tareas</h1>
      <p className="mt-1 text-stone-500">Pautas y actividades para trabajar entre sesiones.</p>

      <div className="card-orienta mt-8 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-terracota-100 text-terracota-600">
          <ClipboardList size={28} />
        </div>
        <h2 className="text-lg font-bold text-tierra-800">Aún no tienes tareas</h2>
        <p className="mt-2 text-sm text-stone-600">
          Cuando tengas actividades asignadas, aparecerán aquí.
        </p>
      </div>
    </div>
  );
}