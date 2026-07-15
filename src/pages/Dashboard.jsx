// src/pages/Dashboard.jsx
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Calendar, MessageSquare, Brain, BookOpen } from 'lucide-react'; // Usamos iconos vectoriales para más calidad

const modulos = [
  {
    to: '/citas',
    icon: <Calendar className="w-8 h-8 text-teal-600" />,
    titulo: 'Consulta con Antonio',
    desc: 'Reserva una sesión de videollamada. Te confirmaremos el enlace.',
    color: 'border-teal-100 hover:border-teal-300',
    accion: 'Reservar cita',
  },
  {
    to: '/chat',
    icon: <MessageSquare className="w-8 h-8 text-blue-600" />,
    titulo: 'Chat de apoyo 24h',
    desc: 'Orientación psicoeducativa con IA. Resuelve dudas sobre el desarrollo de tu hijo/a.',
    color: 'border-blue-100 hover:border-blue-300',
    accion: 'Abrir chat',
  },
  {
    to: '/braintrain',
    icon: <Brain className="w-8 h-8 text-purple-600" />,
    titulo: 'Brain Train',
    desc: 'Cuestionario de desarrollo neuropsicológico para niños de 0 a 6 años.',
    color: 'border-purple-100 hover:border-purple-300',
    accion: 'Iniciar evaluación',
  },
  {
    to: '/talleres',
    icon: <BookOpen className="w-8 h-8 text-amber-600" />,
    titulo: 'Talleres y cursos',
    desc: 'Contenido grabado sobre crianza, desarrollo emocional y estimulación temprana.',
    color: 'border-amber-100 hover:border-amber-300',
    accion: 'Ver talleres',
  },
];

export default function Dashboard() {
  const { user } = useAuth();

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-8">
      {/* Saludo con mayor impacto */}
      <div className="mb-10 text-center sm:text-left">
        <h1 className="text-3xl sm:text-4xl font-bold text-stone-800">
          Hola, {user?.nombre_usuario} 👋
        </h1>
        <p className="text-stone-500 mt-2 text-lg">
          ¿En qué podemos acompañarte hoy en tu camino al bienestar?
        </p>
      </div>

      {/* Grid de módulos optimizado */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {modulos.map((m) => (
          <Link
            key={m.to}
            to={m.to}
            className={`group block bg-white border-2 rounded-3xl p-6 transition-all hover:shadow-lg hover:-translate-y-1 ${m.color}`}
          >
            <div className="mb-4 bg-stone-50 w-16 h-16 rounded-2xl flex items-center justify-center group-hover:bg-white transition">
              {m.icon}
            </div>
            <h2 className="text-xl font-bold text-stone-800">{m.titulo}</h2>
            <p className="text-stone-500 mt-2 leading-relaxed h-16">{m.desc}</p>
            <div className="mt-4 flex items-center text-teal-700 font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
              {m.accion} <span className="ml-2">→</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}