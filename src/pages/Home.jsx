// src/pages/Home.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { LifeBuoy, Baby, GraduationCap } from 'lucide-react';

const testimonios = [
  { texto: 'Las sesiones con Antonio han sido un antes y un después. Me ha ayudado a gestionar mi ansiedad de una forma muy práctica.', autor: 'María G.', perfil: 'Estudiante de Derecho' },
  { texto: 'Gracias al trabajo en neurodesarrollo con mi hijo, hemos notado una mejora increíble en su autonomía y confianza.', autor: 'Carlos R.', perfil: 'Padre de familia' },
  { texto: 'El enfoque resolutivo de Antonio es lo que más destaco. Herramientas reales para el día a día.', autor: 'Laura M.', perfil: 'Profesional en activo' },
];

const especialidades = [                                
  { icon: LifeBuoy, titulo: 'Apoyo al cuidador', texto: 'Orientación personalizada y cercana, psicoeducación y estrategias de autocuidado para quien cuida de un familiar.', color: 'bg-terracota-100 text-terracota-600' },
  { icon: Baby, titulo: 'Neurodesarrollo', texto: 'Evaluación y estimulación neuropsicológica y pautas prácticas a familias.', color: 'bg-sage-100 text-sage-600' },
  { icon: GraduationCap, titulo: 'Mediación', texto: 'Desarrollo personal, acompañado en tu propio entorno cotidiano.', color: 'bg-oro-100 text-oro-600' },
];

export default function Home() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % testimonios.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="mx-auto max-w-4xl space-y-16">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-[2rem] border border-crema-200 bg-gradient-to-br from-white via-crema-50 to-crema-200 p-8 sm:p-12">
        <img
          src="/orienta-icon.png"
          alt=""
          aria-hidden="true"
          className="pointer-events-none absolute -right-10 -top-10 h-72 w-72 object-contain opacity-[0.07]"
        />
        <div className="relative flex flex-col-reverse items-center gap-8 md:flex-row md:justify-between">
          <div className="text-center md:text-left">
            <span className="inline-block rounded-full bg-sage-100 px-4 py-1 text-xs font-semibold tracking-wide text-sage-700">
              Psicólogo colegiado AO 14923 · Neuropsicología
            </span>
            <h1 className="mt-4 font-serif text-4xl font-bold text-tierra-800 sm:text-5xl">
              Antonio Cantillo Rueda
            </h1>
            <p className="mt-4 text-stone-600">
              Psicología clínica con un enfoque humano, resolutivo y proactivo.
            </p>
            <p className="mt-3 font-serif text-2xl font-bold text-sage-600">
              Especialista en personas que cuidan
            </p>
            <p className="mt-1 font-serif italic text-terracota-500">Acompañamos a quien cuida</p>
            <div className="mt-8 flex flex-wrap justify-center gap-3 md:justify-start">
              <Link to="/citas" className="btn-primary">Pedir cita</Link>
              <Link to="/registro" className="btn-outline">Crear cuenta</Link>
            </div>
          </div>
          <img
            src="/foto-perfil.jpg"
            alt="Antonio Cantillo"
            className="h-48 w-48 shrink-0 rounded-full border-4 border-oro-400 object-cover shadow-suave sm:h-56 sm:w-56"
          />
        </div>
      </section>

      {/* Imagen de la consulta */}
      <section>
        <img src="/foto-sala.jpg" alt="Consulta" className="h-80 w-full rounded-3xl object-cover shadow-suave" />
        <p className="mt-4 text-center font-serif italic text-stone-500">
          Un espacio diseñado para tu bienestar y tranquilidad.
        </p>
      </section>

      {/* Especialidades */}
      <section className="grid gap-6 md:grid-cols-3">
        {especialidades.map(({ icon: Icon, titulo, texto, color }) => (
          <div key={titulo} className="card-orienta transition hover:-translate-y-1 hover:shadow-suave">
            <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-2xl ${color}`}>
              <Icon size={24} />
            </div>
            <h3 className="mb-2 font-bold text-tierra-800">{titulo}</h3>
            <p className="text-sm text-stone-600">{texto}</p>
          </div>
        ))}
      </section>

      {/* Carrusel de testimonios */}
      <section className="overflow-hidden rounded-3xl bg-sage-500 px-6 py-12 text-center text-white">
        <h2 className="mb-8 font-serif text-2xl font-bold">Lo que dicen de nosotros</h2>
        <div className="relative flex h-44 items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="absolute w-full max-w-lg"
            >
              <p className="mb-3 font-serif text-lg italic">“{testimonios[index].texto}”</p>
              <div className="font-bold text-oro-300">{testimonios[index].autor}</div>
              <div className="text-sm text-sage-100">{testimonios[index].perfil}</div>
            </motion.div>
          </AnimatePresence>
        </div>
        <div className="mt-2 flex justify-center gap-2">
          {testimonios.map((_, i) => (
            <span key={i} className={`h-2 w-2 rounded-full ${i === index ? 'bg-oro-400' : 'bg-white/40'}`} />
          ))}
        </div>
      </section>
    </div>
  );
}
