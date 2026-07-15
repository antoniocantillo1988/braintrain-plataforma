// src/pages/Home.jsx
export default function Home() {
  return (
    <div className="max-w-4xl mx-auto space-y-16">
      {/* Hero Section */}
      <section className="flex flex-col md:flex-row items-center gap-8">
        <img src="/foto-perfil.jpg" alt="Antonio Cantillo" className="w-48 h-48 rounded-full object-cover shadow-lg" />
        <div>
          <h1 className="text-4xl font-serif font-bold text-stone-800">Antonio Cantillo Rueda</h1>
          <p className="text-teal-700 font-medium mt-2">Psicólogo Colegiado AO 14923 · Neuropsicología</p>
          <p className="mt-4 text-stone-600">Psicología clínica con un enfoque humano, resolutivo y proactivo.</p>
          <a href="/citas" className="inline-block mt-6 bg-teal-700 text-white px-8 py-3 rounded-full hover:bg-teal-800 transition">Pedir Cita</a>
        </div>
      </section>

      {/* Imagen de la consulta */}
      <section>
        <img src="/foto-sala.jpg" alt="Consulta" className="w-full h-80 object-cover rounded-3xl shadow-md" />
        <p className="mt-4 text-stone-500 italic text-center">Un espacio diseñado para tu bienestar y tranquilidad.</p>
      </section>
      
      {/* Especialidades */}
      <section className="grid md:grid-cols-3 gap-6">
        <div className="p-6 bg-white rounded-2xl border border-stone-100">
          <h3 className="font-bold text-stone-800 mb-2">Atención en Crisis</h3>
          <p className="text-sm text-stone-600">Acompañamiento terapéutico personalizado y cercano.</p>
        </div>
        <div className="p-6 bg-white rounded-2xl border border-stone-100">
          <h3 className="font-bold text-stone-800 mb-2">Neurodesarrollo</h3>
          <p className="text-sm text-stone-600">Evaluación y apoyo integral para menores y familias.</p>
        </div>
        <div className="p-6 bg-white rounded-2xl border border-stone-100">
          <h3 className="font-bold text-stone-800 mb-2">Mentoría</h3>
          <p className="text-sm text-stone-600">Orientación académica y desarrollo personal.</p>
        </div>
      </section>

      {/* Carrusel de Testimonios */}
      <section className="py-10 bg-stone-50 rounded-3xl px-6 text-center overflow-hidden">
        <h2 className="text-2xl font-bold mb-8">Lo que dicen de nosotros</h2>
        <div className="relative h-40 flex items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="absolute w-full max-w-lg"
            >
              <p className="italic text-lg text-stone-700 mb-2">"{testimonios[index].texto}"</p>
              <div className="font-bold text-teal-800">{testimonios[index].autor}</div>
              <div className="text-sm text-stone-500">{testimonios[index].perfil}</div>
            </motion.div>
          </AnimatePresence>
        </div>
      </section>




    </div>
  );
}