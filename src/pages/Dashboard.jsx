// src/pages/Dashboard.jsx
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const modulos = [
  {
    to: '/citas',
    icon: '📅',
    titulo: 'Consulta con Antonio',
    desc: 'Reserva una sesión de videollamada. Te confirmaremos el enlace.',
    color: 'bg-teal-50 border-teal-200',
    accion: 'Reservar cita',
  },
  {
    to: '/chat',
    icon: '💬',
    titulo: 'Chat de apoyo 24h',
    desc: 'Orientación psicoeducativa con IA. Resuelve dudas sobre el desarrollo de tu hijo/a.',
    color: 'bg-blue-50 border-blue-200',
    accion: 'Abrir chat',
  },
  {
    to: '/braintrain',
    icon: '🧠',
    titulo: 'Brain Train',
    desc: 'Cuestionario de desarrollo neuropsicológico para niños de 0 a 6 años.',
    color: 'bg-purple-50 border-purple-200',
    accion: 'Iniciar evaluación',
  },
  {
    to: '/talleres',
    icon: '🎓',
    titulo: 'Talleres y cursos',
    desc: 'Contenido grabado sobre crianza, desarrollo emocional y estimulación temprana.',
    color: 'bg-amber-50 border-amber-200',
    accion: 'Ver talleres',
  },
];

export default function Dashboard() {
  const { user } = useAuth();

  return (
    <div className="pb-24 sm:pb-0 sm:pl-52">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-stone-800">
          Hola, {user?.nombre_usuario} 👋
        </h1>
        <p className="text-stone-500 mt-1 text-sm">
          ¿En qué te podemos ayudar hoy?
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {modulos.map((m) => (
          <Link
            key={m.to}
            to={m.to}
            className={`block border rounded-2xl p-5 hover:shadow-md transition ${m.color}`}
          >
            <span className="text-3xl">{m.icon}</span>
            <h2 className="text-base font-semibold text-stone-800 mt-3">{m.titulo}</h2>
            <p className="text-sm text-stone-500 mt-1 leading-relaxed">{m.desc}</p>
            <span className="inline-block mt-4 text-sm font-medium text-teal-700">
              {m.accion} →
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
