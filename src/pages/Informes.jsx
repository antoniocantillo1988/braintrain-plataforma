// src/pages/Informes.jsx
import { FileText } from 'lucide-react';

export default function Informes() {
  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="font-serif text-3xl font-bold text-tierra-800">Informes</h1>
      <p className="mt-1 text-stone-500">Resúmenes y seguimiento de tu proceso.</p>

      <div className="card-orienta mt-8 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-oro-100 text-oro-600">
          <FileText size={28} />
        </div>
        <h2 className="text-lg font-bold text-tierra-800">Aún no hay informes</h2>
        <p className="mt-2 text-sm text-stone-600">
          Cuando haya informes disponibles, podrás consultarlos aquí.
        </p>
      </div>
    </div>
  );
}