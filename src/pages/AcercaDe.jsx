// src/pages/AcercaDe.jsx
import { Link } from 'react-router-dom';
import {
  GraduationCap, Award, BadgeCheck, HeartHandshake, Brain, MapPin,
  Phone, AtSign, ClipboardList, Route, RefreshCw,
} from 'lucide-react';

const credenciales = [
  { icon: GraduationCap, texto: 'Graduado en Psicología por la Universidad de Málaga.' },
  { icon: Award, texto: 'Máster en Neuropsicología del Desarrollo y Atención Temprana por la Universidad de Córdoba.' },
  { icon: BadgeCheck, texto: 'Colegiado nº AO14923 en el Colegio Oficial de Psicología de Andalucía Oriental (COPAO).' },
];

const servicios = [
  {
    icon: HeartHandshake,
    color: 'bg-terracota-100 text-terracota-600',
    titulo: 'Orientación y apoyo a cuidadores',
    texto:
      'Un espacio de respiro y guía para quienes dedican su vida al cuidado de un familiar: estrategias de autocuidado, gestión del estrés y acompañamiento en la adaptación al rol de cuidador.',
  },
  {
    icon: Brain,
    color: 'bg-sage-100 text-sage-600',
    titulo: 'Intervención neuropsicológica',
    texto:
      'Valoración de capacidades cognitivas y planes de estimulación adaptados al hogar, con pautas de comunicación y orientación ambiental para toda la familia.',
  },
];

const pasos = [
  {
    icon: ClipboardList,
    titulo: 'Evaluación inicial',
    texto: 'Analizamos la situación del cuidador y de su familiar para identificar los focos de sobrecarga y las áreas prioritarias.',
  },
  {
    icon: Route,
    titulo: 'Plan de acción práctico',
    texto: 'Pautas directas y aplicables en el día a día, con atención presencial a domicilio o en formato online seguro.',
  },
  {
    icon: RefreshCw,
    titulo: 'Seguimiento y coordinación',
    texto: 'Revisamos la evolución y ajustamos las estrategias a las necesidades cambiantes del entorno familiar.',
  },
];

// Tarjeta "cristal" para que el texto se lea bien sobre la foto difuminada
const cristal = 'rounded-3xl border border-white/60 bg-white/75 p-6 shadow-suave backdrop-blur-sm sm:p-8';

export default function AcercaDe() {
  return (
    <div className="relative isolate overflow-hidden rounded-[2rem] border border-crema-200">
      {/* Fondo: foto difuminada */}
      <img
        src="/andando.jpg"
        alt=""
        aria-hidden="true"
        className="absolute inset-0 -z-20 h-full w-full scale-105 object-cover blur-[3px]"
      />
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-crema-50/45 via-crema-50/25 to-crema-100/55" />

      <div className="mx-auto max-w-4xl space-y-8 px-4 py-10 sm:px-8 sm:py-14">
        {/* Cabecera */}
        <header className={`${cristal} text-center`}>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-oro-600">Acerca de nosotros</p>
          <h1 className="mt-3 font-serif text-3xl font-bold text-tierra-800 sm:text-4xl">
            Apoyo neuropsicológico y orientación experta para cuidadores y familias
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-stone-600">
            Reducimos la carga invisible del cuidador mediante estrategias de estimulación cognitiva,
            organización domiciliaria y bienestar emocional preventivo. Un enfoque humano, cercano y especializado.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link to="/citas" className="btn-primary">Reserva una sesión de orientación</Link>
            <a href="#servicios" className="btn-outline">Conoce mis servicios</a>
          </div>
        </header>

        {/* Sobre mí */}
        <section className={cristal}>
          <h2 className="font-serif text-2xl font-bold text-tierra-800">Sobre mí y mi marco profesional</h2>
          <p className="mt-3 text-stone-600">
            Ofrezco un espacio de acompañamiento riguroso y humano a quienes dedican su vida al cuidado de
            familiares con dependencia o necesidades neurodesarrolladas.
          </p>

          <ul className="mt-5 space-y-3">
            {credenciales.map(({ icon: Icon, texto }) => (
              <li key={texto} className="flex items-start gap-3 text-sm text-stone-700">
                <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sage-100 text-sage-600">
                  <Icon size={16} />
                </span>
                {texto}
              </li>
            ))}
          </ul>

          <blockquote className="mt-6 border-l-4 border-terracota-500 pl-4 font-serif italic text-stone-600">
            Mi labor se centra en la psicoeducación, la estimulación neuropsicológica y la consultoría de apoyo
            al cuidador, ofreciendo herramientas prácticas para el día a día, la gestión del estrés derivado de
            la atención prolongada y la mejora de la calidad de vida en el entorno familiar, trabajando en red
            con otros profesionales sociosanitarios cuando el caso lo requiere.
          </blockquote>
        </section>

        {/* Áreas de servicio */}
        <section id="servicios" className="scroll-mt-20">
          <h2 className="mb-4 px-1 font-serif text-2xl font-bold text-tierra-800 [text-shadow:0_1px_8px_rgba(255,255,255,0.9)]">
            Áreas de servicio
          </h2>
          <div className="grid gap-6 md:grid-cols-2">
            {servicios.map(({ icon: Icon, color, titulo, texto }) => (
              <div key={titulo} className={cristal}>
                <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-2xl ${color}`}>
                  <Icon size={24} />
                </div>
                <h3 className="text-lg font-bold text-tierra-800">{titulo}</h3>
                <p className="mt-2 text-sm leading-relaxed text-stone-600">{texto}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Metodología */}
        <section className={cristal}>
          <h2 className="font-serif text-2xl font-bold text-tierra-800">Cómo trabajamos</h2>
          <div className="mt-5 grid gap-6 md:grid-cols-3">
            {pasos.map(({ icon: Icon, titulo, texto }, i) => (
              <div key={titulo}>
                <div className="mb-3 flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-sage-500 text-sm font-bold text-white">
                    {i + 1}
                  </span>
                  <Icon size={20} className="text-oro-600" />
                </div>
                <h3 className="font-bold text-tierra-800">{titulo}</h3>
                <p className="mt-1 text-sm leading-relaxed text-stone-600">{texto}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Divulgación y contacto */}
        <section className="grid gap-6 md:grid-cols-2">
          <div className={cristal}>
            <h2 className="font-serif text-xl font-bold text-tierra-800">Divulgación</h2>
            <p className="mt-2 text-sm leading-relaxed text-stone-600">
              Pautas breves y recursos sobre neuropsicología cotidiana y bienestar del cuidador.
            </p>
            <a
              href="https://www.instagram.com/orientamejoraemocional/"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-outline mt-4"
            >
              <AtSign size={16} /> @orientamejoraemocional
            </a>
          </div>

          <div className={cristal}>
            <h2 className="font-serif text-xl font-bold text-tierra-800">Contacto y zona de actuación</h2>
            <p className="mt-2 flex items-start gap-2 text-sm leading-relaxed text-stone-600">
              <MapPin size={16} className="mt-0.5 shrink-0 text-terracota-500" />
              Málaga capital, Campanillas y un radio de 25 km, con atención presencial a domicilio u online.
            </p>
            <a
              href="https://wa.me/34678766839"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary mt-4"
            >
              <Phone size={16} /> Consultas por WhatsApp
            </a>
          </div>
        </section>
      </div>
    </div>
  );
}