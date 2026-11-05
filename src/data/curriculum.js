/**
 * Plan de estudios local (semilla de SQLite).
 *
 * 15 módulos escalonados según el MCER (A1 → B2), 14 tarjetas cada uno
 * (210 en total). Cada módulo se divide en 6 nodos que alternan los modos de
 * juego y termina con un jefe (Supervivencia).
 *
 * Si se edita el contenido, sube CURRICULUM_VERSION: la app vuelve a sembrar
 * las tablas sin tocar el progreso del usuario (los IDs de nodo son estables).
 */

export const CURRICULUM_VERSION = 1;

const m = (id, level, title, subtitle, words) => ({ id, level, title, subtitle, words });

export const MODULES = [
  m('m01', 'A1', 'Saludos y básicos', 'Preséntate y saluda', [
    ['Hello', 'Hola'], ['Good morning', 'Buenos días'], ['Good afternoon', 'Buenas tardes'],
    ['Good night', 'Buenas noches'], ['Goodbye', 'Adiós'], ['See you later', 'Hasta luego'],
    ['Please', 'Por favor'], ['Thank you', 'Gracias'], ["You're welcome", 'De nada'],
    ['Excuse me', 'Disculpe'], ["I'm sorry", 'Lo siento'], ['How are you?', '¿Cómo estás?'],
    ['Nice to meet you', 'Mucho gusto'], ['My name is…', 'Me llamo…'],
  ]),
  m('m02', 'A1', 'Números y tiempo', 'Cuenta, días y horas', [
    ['One', 'Uno'], ['Two', 'Dos'], ['Three', 'Tres'], ['Ten', 'Diez'], ['Twenty', 'Veinte'],
    ['One hundred', 'Cien'], ['Monday', 'Lunes'], ['Friday', 'Viernes'], ['Sunday', 'Domingo'],
    ['Today', 'Hoy'], ['Tomorrow', 'Mañana'], ['Yesterday', 'Ayer'], ['Week', 'Semana'],
    ["What time is it?", '¿Qué hora es?'],
  ]),
  m('m03', 'A1', 'Familia y personas', 'Tu círculo cercano', [
    ['Mother', 'Madre'], ['Father', 'Padre'], ['Brother', 'Hermano'], ['Sister', 'Hermana'],
    ['Son', 'Hijo'], ['Daughter', 'Hija'], ['Grandmother', 'Abuela'], ['Grandfather', 'Abuelo'],
    ['Uncle', 'Tío'], ['Aunt', 'Tía'], ['Cousin', 'Primo'], ['Husband', 'Esposo'],
    ['Wife', 'Esposa'], ['Friend', 'Amigo'],
  ]),
  m('m04', 'A1', 'Comida y bebida', 'En la mesa y el restaurante', [
    ['Water', 'Agua'], ['Bread', 'Pan'], ['Rice', 'Arroz'], ['Chicken', 'Pollo'], ['Fish', 'Pescado'],
    ['Apple', 'Manzana'], ['Cheese', 'Queso'], ['Egg', 'Huevo'], ['Coffee', 'Café'], ['Milk', 'Leche'],
    ['Breakfast', 'Desayuno'], ['Lunch', 'Almuerzo'], ['Dinner', 'Cena'], ["I'm hungry", 'Tengo hambre'],
  ]),
  m('m05', 'A2', 'Casa y rutina diaria', 'Tu día a día', [
    ['Kitchen', 'Cocina'], ['Bedroom', 'Habitación'], ['Bathroom', 'Baño'], ['Living room', 'Sala'],
    ['To wake up', 'Despertarse'], ['To get up', 'Levantarse'], ['To take a shower', 'Ducharse'],
    ['To get dressed', 'Vestirse'], ['To brush your teeth', 'Cepillarse los dientes'],
    ['To have breakfast', 'Desayunar'], ['To go to work', 'Ir al trabajo'],
    ['To do the dishes', 'Lavar los platos'], ['To go to bed', 'Acostarse'], ['Every day', 'Todos los días'],
  ]),
  m('m06', 'A2', 'Ciudad y direcciones', 'Muévete por la ciudad', [
    ['Street', 'Calle'], ['Corner', 'Esquina'], ['Traffic light', 'Semáforo'], ['Bus stop', 'Parada de autobús'],
    ['Post office', 'Oficina de correos'], ['Bank', 'Banco'], ['Pharmacy', 'Farmacia'], ['Supermarket', 'Supermercado'],
    ['Turn left', 'Gira a la izquierda'], ['Turn right', 'Gira a la derecha'], ['Go straight', 'Sigue derecho'],
    ['Next to', 'Al lado de'], ['In front of', 'En frente de'], ['Where is…?', '¿Dónde está…?'],
  ]),
  m('m07', 'A2', 'Compras y ropa', 'Tiendas, tallas y precios', [
    ['Shirt', 'Camisa'], ['Pants', 'Pantalones'], ['Shoes', 'Zapatos'], ['Dress', 'Vestido'],
    ['Jacket', 'Chaqueta'], ['Size', 'Talla'], ['Price', 'Precio'], ['Cheap', 'Barato'],
    ['Expensive', 'Caro'], ['Discount', 'Descuento'], ['Cash', 'Efectivo'], ['Receipt', 'Recibo'],
    ['How much is it?', '¿Cuánto cuesta?'], ['Can I try it on?', '¿Me lo puedo probar?'],
  ]),
  m('m08', 'A2', 'Verbos irregulares', 'Pasado simple y participio', [
    ['go – went – gone', 'Ir'], ['be – was/were – been', 'Ser / estar'], ['have – had – had', 'Tener'],
    ['do – did – done', 'Hacer'], ['make – made – made', 'Fabricar / hacer'], ['say – said – said', 'Decir'],
    ['see – saw – seen', 'Ver'], ['take – took – taken', 'Tomar'], ['come – came – come', 'Venir'],
    ['know – knew – known', 'Saber / conocer'], ['think – thought – thought', 'Pensar'],
    ['buy – bought – bought', 'Comprar'], ['write – wrote – written', 'Escribir'], ['speak – spoke – spoken', 'Hablar'],
  ]),
  m('m09', 'B1', 'Viajes y transporte', 'Aeropuertos, hoteles y trayectos', [
    ['Boarding pass', 'Pase de abordar'], ['Luggage', 'Equipaje'], ['Departure', 'Salida'], ['Arrival', 'Llegada'],
    ['Delayed', 'Retrasado'], ['Round trip', 'Ida y vuelta'], ['One-way ticket', 'Boleto de ida'],
    ['Reservation', 'Reserva'], ['To check in', 'Registrarse'], ['To check out', 'Hacer el check-out'],
    ['Customs', 'Aduana'], ['Sightseeing', 'Turismo'], ['Abroad', 'En el extranjero'], ['Jet lag', 'Desfase horario'],
  ]),
  m('m10', 'B1', 'Phrasal verbs', 'Verbos con partícula de uso diario', [
    ['Give up', 'Rendirse'], ['Look for', 'Buscar'], ['Find out', 'Averiguar'], ['Turn on', 'Encender'],
    ['Turn off', 'Apagar'], ['Pick up', 'Recoger'], ['Put off', 'Posponer'], ['Run out of', 'Quedarse sin'],
    ['Get along with', 'Llevarse bien con'], ['Look after', 'Cuidar'], ['Carry on', 'Continuar'],
    ['Set up', 'Configurar / montar'], ['Break down', 'Averiarse'], ['Come up with', 'Idear / proponer'],
  ]),
  m('m11', 'B1', 'Salud y cuerpo', 'En el médico', [
    ['Headache', 'Dolor de cabeza'], ['Stomachache', 'Dolor de estómago'], ['Fever', 'Fiebre'], ['Cough', 'Tos'],
    ['Sore throat', 'Dolor de garganta'], ['Prescription', 'Receta médica'], ['Appointment', 'Cita'],
    ['Allergy', 'Alergia'], ['Injury', 'Lesión'], ['To recover', 'Recuperarse'], ['To feel dizzy', 'Sentirse mareado'],
    ['Painkiller', 'Analgésico'], ['Healthy', 'Saludable'], ['To get better', 'Mejorar'],
  ]),
  m('m12', 'B1', 'Emociones y opiniones', 'Expresa lo que sientes y piensas', [
    ['Proud', 'Orgulloso'], ['Worried', 'Preocupado'], ['Disappointed', 'Decepcionado'], ['Excited', 'Emocionado'],
    ['Embarrassed', 'Avergonzado'], ['Grateful', 'Agradecido'], ['Jealous', 'Celoso'], ['Relieved', 'Aliviado'],
    ['In my opinion', 'En mi opinión'], ['I agree', 'Estoy de acuerdo'], ['I disagree', 'No estoy de acuerdo'],
    ['It depends', 'Depende'], ['As far as I know', 'Hasta donde sé'], ['To be honest', 'Para ser honesto'],
  ]),
  m('m13', 'B2', 'Trabajo y oficina', 'Vida profesional', [
    ['Deadline', 'Fecha límite'], ['Meeting', 'Reunión'], ['Schedule', 'Horario / agenda'], ['Coworker', 'Compañero de trabajo'],
    ['Boss', 'Jefe'], ['Salary', 'Salario'], ['Promotion', 'Ascenso'], ['To hire', 'Contratar'], ['To fire', 'Despedir'],
    ['Job interview', 'Entrevista de trabajo'], ['Resume', 'Hoja de vida'], ['Workload', 'Carga de trabajo'],
    ['To work overtime', 'Trabajar horas extra'], ['Remote work', 'Trabajo remoto'],
  ]),
  m('m14', 'B2', 'Expresiones idiomáticas', 'Habla como nativo', [
    ["Break the ice", 'Romper el hielo'], ["Piece of cake", 'Pan comido'], ["Hit the books", 'Ponerse a estudiar'],
    ["Under the weather", 'Sentirse mal'], ["Cost an arm and a leg", 'Costar un ojo de la cara'],
    ["Once in a blue moon", 'Muy de vez en cuando'], ["Spill the beans", 'Revelar el secreto'],
    ["Call it a day", 'Dar por terminado el día'], ["On the same page", 'En la misma sintonía'],
    ["Beat around the bush", 'Andarse con rodeos'], ["The ball is in your court", 'La pelota está en tu cancha'],
    ["Get the hang of it", 'Agarrarle el truco'], ["Keep an eye on", 'Echarle un ojo a'], ["Better late than never", 'Más vale tarde que nunca'],
  ]),
  m('m15', 'B2', 'Inglés de negocios', 'Negocia, presenta y cierra tratos', [
    ['Stakeholder', 'Parte interesada'], ['Revenue', 'Ingresos'], ['Profit', 'Ganancia'], ['Budget', 'Presupuesto'],
    ['Forecast', 'Pronóstico'], ['Negotiation', 'Negociación'], ['Contract', 'Contrato'], ['Supplier', 'Proveedor'],
    ['Market share', 'Cuota de mercado'], ['Return on investment', 'Retorno de inversión'],
    ['To close a deal', 'Cerrar un trato'], ['To follow up', 'Hacer seguimiento'],
    ['Quarterly report', 'Informe trimestral'], ['Key performance indicator', 'Indicador clave de desempeño'],
  ]),
];

/**
 * Nodos de cada módulo. `cards` son índices sobre las 14 palabras.
 * Alterna aprender → practicar → memorizar y cierra con el jefe.
 */
export const NODE_PLAN = [
  { slug: 'learn-1', type: 'flashcards', title: 'Aprende I', cards: [0, 7] },
  { slug: 'swipe-1', type: 'swipe', title: 'Practica I', cards: [0, 7] },
  { slug: 'learn-2', type: 'flashcards', title: 'Aprende II', cards: [7, 14] },
  { slug: 'memory', type: 'memory', title: 'Memoria', cards: [7, 14] },
  { slug: 'swipe-2', type: 'swipe', title: 'Repaso', cards: [0, 14] },
  { slug: 'boss', type: 'boss', title: 'Jefe', cards: [0, 14] },
];

/** Precisión mínima para completar cada tipo de nodo. */
export const PASS_ACCURACY = { flashcards: 0, memory: 0, swipe: 0.7, boss: 0.7 };

export const TOTAL_WORDS = MODULES.reduce((n, mod) => n + mod.words.length, 0);
export const TOTAL_NODES = MODULES.length * NODE_PLAN.length;
