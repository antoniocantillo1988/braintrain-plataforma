// src/pages/Material.jsx
import { FolderOpen } from 'lucide-react';

export default function Material() {
  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="font-serif text-3xl font-bold text-tierra-800">Materiales y guías</h1>
      <p className="mt-1 text-stone-500">Recursos prácticos para familias y cuidadores.</p>

      <div className="card-orienta mt-8 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-sage-100 text-sage-600">
          <FolderOpen size={28} />
        </div>
        <h2 className="text-lg font-bold text-tierra-800">Próximamente</h2>
        <p className="mt-2 text-sm text-stone-600">
          Estamos preparando guías descargables y materiales de estimulación para el día a día.
        </p>
      </div>
    </div>
  );
}