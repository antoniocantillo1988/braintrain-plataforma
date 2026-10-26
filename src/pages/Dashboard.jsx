// src/pages/Dashboard.jsx
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Calendar, MessageSquare, Brain, BookOpen, CalendarCheck, Users } from 'lucide-react';

const modulos = [
  {
    to: '/citas',
    icon: Calendar,
    iconColor: 'text-sage-600 bg-sage-100',
    titulo: 'Consulta con Antonio',
    desc: 'Reserva una sesión de videollamada. Te confirmaremos el enlace.',
    accion: 'Reservar cita',
  },
  {
    to: '/chat',
    icon: MessageSquare,
    iconColor: 'text-terracota-600 bg-terracota-100',
    titulo: 'Chat de apoyo 24h',
    desc: 'Orientación psicoeducativa con IA. Resuelve dudas sobre el desarrollo de tu hijo/a.',
    accion: 'Abrir chat',
  },
  {
    to: '/braintrain',
    icon: Brain,
    iconColor: 'text-oro-600 bg-oro-100',
    titulo: 'Brain Train',
    desc: 'Cuestionario de desarrollo neuropsicológico para niños de 0 a 6 años.',
    accion: 'Iniciar evaluación',
  },
  {
    to: '/talleres',
    icon: BookOpen,
    iconColor: 'text-sage-700 bg-crema-200',
    titulo: 'Talleres y cursos',
    desc: 'Contenido grabado sobre crianza, desarrollo emocional y estimulación temprana.',
    accion: 'Ver talleres',
  },
];

const modulosAdmin = [
  {
    to: '/admin/citas',
    icon: CalendarCheck,
    iconColor: 'text-sage-600 bg-sage-100',
    titulo: 'Modificar citas',
    desc: 'Confirma, cancela o elimina citas y gestiona tus huecos de disponibilidad.',
    accion: 'Gestionar citas',
  },
  {
    to: '/admin/usuarios',
    icon: Users,
    iconColor: 'text-terracota-600 bg-terracota-100',
    titulo: 'Modificar usuarios',
    desc: 'Edita nombres, cambia roles de usuario o administrador y elimina cuentas.',
    accion: 'Gestionar usuarios',
  },
];

function Tarjeta({ m }) {
  const Icon = m.icon;
  return (
    <Link
      to={m.to}
      className="group block rounded-3xl border border-crema-200 bg-white p-6 transition-all hover:-translate-y-1 hover:border-sage-300 hover:shadow-suave"
    >
      <div className={`mb-4 flex h-14 w-14 items-center justify-center rounded-2xl ${m.iconColor}`}>
        <Icon className="h-7 w-7" />
      </div>
      <h2 className="text-xl font-bold text-tierra-800">{m.titulo}</h2>
      <p className="mt-2 min-h-[4rem] leading-relaxed text-stone-500">{m.desc}</p>
      <div className="mt-4 flex items-center font-semibold text-sage-600 opacity-0 transition-opacity group-hover:opacity-100">
        {m.accion} <span className="ml-2">→</span>
      </div>
    </Link>
  );
}

export default function Dashboard() {
  const { user, isAdmin } = useAuth();

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-10 text-center sm:text-left">
        <h1 className="font-serif text-3xl font-bold text-tierra-800 sm:text-4xl">
          Hola, {user?.nombre_usuario}
        </h1>
        <p className="mt-2 text-lg text-stone-500">
          ¿En qué podemos acompañarte hoy en tu camino al bienestar?
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {modulos.map((m) => <Tarjeta key={m.to} m={m} />)}
      </div>

      {isAdmin && (
        <>
          <h2 className="mb-4 mt-12 text-sm font-semibold uppercase tracking-wider text-oro-600">
            Administración
          </h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {modulosAdmin.map((m) => <Tarjeta key={m.to} m={m} />)}
          </div>
        </>
      )}
    </div>
  );
}
