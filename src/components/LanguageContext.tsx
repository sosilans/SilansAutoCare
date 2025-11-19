import { createContext, useContext, useState, ReactNode } from 'react';

type Language = 'en' | 'es' | 'ru';

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const translations: Record<Language, Record<string, string>> = {
  en: {
    // Header
    'nav.about': 'About',
    'nav.portfolio': 'Portfolio',
    'nav.services': 'Services',
    'nav.reviews': 'Reviews',
    'nav.faq': 'FAQ',
    'nav.contact': 'Contact',
    
    // Hero
    'hero.badge': 'Your Detailing Expert',
    'hero.online': 'Available Now',
    'hero.offline': 'Not Available',
    'hero.title': 'Silans Auto Care',
    'hero.subtitle': 'Your Car Deserves The Best!',
    'hero.description': 'Professional detailing services that make your car shine like new. We bring back that fresh-from-the-showroom feeling!',
    'hero.cta.primary': 'Get Started',
    'hero.cta.secondary': 'Book Now',
    'hero.click': 'Click to see more examples',
    
    // About
    'about.badge': 'About Us',
    'about.title': 'Passion Meets Precision',
    'about.subtitle': 'Your friendly neighborhood auto care experts in Sacramento!',
    'about.heading': 'Making Cars Smile Since Day One!',
    'about.text1': 'Welcome to our world of automotive perfection! We\'re not just another car wash - we\'re artists who treat every vehicle like a masterpiece.',
    'about.text2': 'With years of experience and a genuine love for what we do, we bring professional mobile detailing right to your doorstep. From ceramic coatings to paint correction, we use only premium products and techniques.',
    'about.text3': 'Our mission? To make your car look and feel brand new, every single time. Because your ride deserves nothing but the best!',
    'about.stats.cars': 'Cars',
    'about.stats.reviews': '5-Star Reviews',
    'about.stats.happy': 'Happy',
    'about.quality': 'Quality',
    'about.quality.desc': 'Premium products & expert care',
    'about.passion': 'Passion',
    'about.passion.desc': 'We love what we do!',
    'about.excellence': 'Excellence',
    'about.excellence.desc': 'Outstanding results, always',
    'about.happy': 'Happy Clients',
    'about.happy.desc': 'Your satisfaction matters',
    
    // Portfolio
    'portfolio.badge': 'Our Work',
    'portfolio.title': 'Transformation Gallery',
    'portfolio.subtitle': 'See the magic we create, one vehicle at a time',
    'portfolio.before': 'Before',
    'portfolio.after': 'After',
    'portfolio.viewMore': 'View More',
    'portfolio.showLess': 'Show Less',
    
    // Services
    'services.badge': 'Services',
    'services.title': 'What We Offer',
    'services.subtitle': 'Premium services tailored to your vehicle\'s needs',
    'services.express.title': 'Express Wash',
    'services.express.desc': 'Quick exterior wash and dry',
    'services.express.time': '30-45 min',
    'services.standard.title': 'Standard Detail',
    'services.standard.desc': 'Exterior wash, interior vacuum & wipe down',
    'services.standard.time': '1-2 hours',
    'services.premium.title': 'Premium Detail',
    'services.premium.desc': 'Deep clean inside and out with wax protection',
    'services.premium.time': '2-3 hours',
    'services.ultimate.title': 'Ultimate Detail',
    'services.ultimate.desc': 'Complete restoration with ceramic coating',
    'services.ultimate.time': '4-6 hours',
    'services.interior.title': 'Interior Deep Clean',
    'services.interior.desc': 'Thorough cleaning of all interior surfaces',
    'services.paint.title': 'Paint Correction',
    'services.paint.desc': 'Remove scratches and restore shine',
    'services.ceramic.title': 'Ceramic Coating',
    'services.ceramic.desc': 'Long-lasting protective coating',
    'services.engine.title': 'Engine Bay Detail',
    'services.engine.desc': 'Clean and protect your engine compartment',
    
    // Reviews
    'reviews.badge': 'Testimonials',
    'reviews.title': 'Happy Customers!',
    'reviews.subtitle': 'See what our wonderful clients have to say about us!',
    'reviews.showMore': 'Show More Reviews',
    'reviews.showLess': 'Show Less',
    'reviews.leave': 'Leave a Review',
    'reviews.form.title': 'We\'d Love to Hear From You!',
    'reviews.form.register': 'Please register to leave a review. It only takes a moment!',
    'reviews.form.cooldown': 'You can leave another review in {time}. Thank you for your patience!',
    'reviews.form.name': 'Your Name',
    'reviews.form.email': 'Your Email',
    'reviews.form.message': 'Share your experience...',
    'reviews.form.registerSubmit': 'Register & Submit',
    'reviews.form.submit': 'Submit Review',
    'reviews.form.cancel': 'Cancel',

    // Auth generic
    'auth.login': 'Login',
    'auth.register': 'Register',
    'reviews.auth.prompt': 'To leave a review, please log in or register',
    
    // FAQ
    'faq.badge': 'FAQ',
    'faq.title': 'Frequently Asked Questions',
    'faq.subtitle': 'Find answers to common questions from our clients',
    'faq.showMore': 'Show More Questions',
    'faq.showLess': 'Show Less',
    'faq.ask': 'Ask a Question',
    'faq.form.title': 'We\'re Here to Help!',
    'faq.form.register': 'Please register to ask a question. It only takes a moment!',
    'faq.form.name': 'Your Name',
    'faq.form.email': 'Your Email',
    'faq.form.question': 'Your question...',
    'faq.form.registerSubmit': 'Register & Submit',
    'faq.form.submit': 'Submit Question',
    'faq.form.cancel': 'Cancel',
    
    // Contact
    'contact.badge': 'Contact',
    'contact.title': 'Let\'s Get Started!',
    'contact.subtitle': 'Ready to give your car the treatment it deserves?',
    'contact.info.title': 'Get in Touch',
    'contact.info.subtitle': 'We\'re here to answer your questions',
    'contact.form.title': 'Send us a Message',
    'contact.form.name': 'Your Name',
    'contact.form.email': 'Your Email',
    'contact.form.phone': 'Phone Number',
    'contact.form.service': 'Service Needed',
    'contact.form.message': 'Tell us about your vehicle and what you need...',
    'contact.form.send': 'Send Message',
    'contact.phone': 'Phone',
    'contact.email': 'Email',
    'contact.hours': 'Hours',
    'contact.hours.value': 'Mon-Sat: 8AM - 6PM',
    'contact.location': 'Location',
    'contact.quickMessage': 'Quick Message',
    'contact.submitSuccess': 'Thank you! We will get back to you soon!',
    'contact.form.namePlaceholder': 'John Doe',
    'contact.form.emailPlaceholder': 'john@example.com',
    'contact.form.phonePlaceholder': '+1 (916) 555-0123',
    'contact.form.messagePlaceholder': 'Tell us about your car and what service you need...',
    
    // Footer
    'footer.tagline': 'Premium Mobile Auto Detailing',
    'footer.description': 'Bringing professional car care right to your doorstep. Quality service, every time.',
    'footer.quick': 'Quick Links',
    'footer.services': 'Services',
    'footer.contact': 'Contact Us',
    'footer.rights': 'All rights reserved.',
  },
  es: {
    // Header
    'nav.about': 'Nosotros',
    'nav.portfolio': 'Portafolio',
    'nav.services': 'Servicios',
    'nav.reviews': 'Reseñas',
    'nav.faq': 'Preguntas',
    'nav.contact': 'Contacto',
    
    // Hero
    'hero.badge': 'Tu Experto en Detallado',
    'hero.online': 'Disponible Ahora',
    'hero.offline': 'No Disponible',
    'hero.title': 'Silans Auto Care',
    'hero.subtitle': '¡Tu Auto Merece Lo Mejor!',
    'hero.description': 'Servicios profesionales de detallado que hacen brillar tu auto como nuevo. ¡Te devolvemos esa sensación de recién salido del concesionario!',
    'hero.cta.primary': 'Comenzar',
    'hero.cta.secondary': 'Reservar Ahora',
    'hero.click': 'Haz clic para ver más ejemplos',
    
    // About
    'about.badge': 'Sobre Nosotros',
    'about.title': 'La Pasión Encuentra la Precisión',
    'about.subtitle': '¡Expertos en cuidado de autos en tu vecindario en Sacramento!',
    'about.heading': '¡Haciendo Reír Autos Desde el Día Uno!',
    'about.text1': '¡Bienvenido a nuestro mundo de perfección automotriz! No somos solo otro lavado de autos - somos artistas que tratamos cada vehículo como una obra maestra.',
    'about.text2': 'Con años de experiencia y un amor genuino por lo que hacemos, llevamos el detallado móvil profesional directamente a tu puerta. Desde revestimientos cerámicos hasta corrección de pintura, usamos solo productos y técnicas premium.',
    'about.text3': '¿Nuestra misión? Hacer que tu auto se vea y se sienta como nuevo, cada vez. ¡Porque tu vehículo merece solo lo mejor!',
    'about.stats.cars': 'Autos',
    'about.stats.reviews': 'Reseñas de 5 Estrellas',
    'about.stats.happy': 'Felices',
    'about.quality': 'Calidad',
    'about.quality.desc': 'Productos premium & cuidado experto',
    'about.passion': 'Pasión',
    'about.passion.desc': '¡Amamos lo que hacemos!',
    'about.excellence': 'Excelencia',
    'about.excellence.desc': 'Resultados sobresalientes, siempre',
    'about.happy': 'Clientes Felices',
    'about.happy.desc': 'Tu satisfacción nos importa',
    
    // Portfolio
    'portfolio.badge': 'Nuestro Trabajo',
    'portfolio.title': 'Galería de Transformación',
    'portfolio.subtitle': 'Mira la magia que creamos, un vehículo a la vez',
    'portfolio.before': 'Antes',
    'portfolio.after': 'Después',
    'portfolio.viewMore': 'Ver Más',
    'portfolio.showLess': 'Mostrar Menos',
    
    // Services
    'services.badge': 'Servicios',
    'services.title': 'Lo Que Ofrecemos',
    'services.subtitle': 'Servicios premium adaptados a las necesidades de tu vehículo',
    'services.express.title': 'Lavado Expreso',
    'services.express.desc': 'Lavado y secado exterior rápido',
    'services.express.time': '30-45 min',
    'services.standard.title': 'Detallado Estándar',
    'services.standard.desc': 'Lavado exterior, aspirado y limpieza interior',
    'services.standard.time': '1-2 horas',
    'services.premium.title': 'Detallado Premium',
    'services.premium.desc': 'Limpieza profunda por dentro y por fuera con protección de cera',
    'services.premium.time': '2-3 horas',
    'services.ultimate.title': 'Detallado Ultimate',
    'services.ultimate.desc': 'Restauración completa con revestimiento cerámico',
    'services.ultimate.time': '4-6 horas',
    'services.interior.title': 'Limpieza Profunda Interior',
    'services.interior.desc': 'Limpieza minuciosa de todas las superficies interiores',
    'services.paint.title': 'Corrección de Pintura',
    'services.paint.desc': 'Elimina arañazos y restaura el brillo',
    'services.ceramic.title': 'Revestimiento Cerámico',
    'services.ceramic.desc': 'Revestimiento protector de larga duración',
    'services.engine.title': 'Detallado de Motor',
    'services.engine.desc': 'Limpia y protege el compartimento del motor',
    
    // Reviews
    'reviews.badge': 'Testimonios',
    'reviews.title': '¡Clientes Felices!',
    'reviews.subtitle': '¡Mira lo que nuestros maravillosos clientes dicen sobre nosotros!',
    'reviews.showMore': 'Mostrar Más Reseñas',
    'reviews.showLess': 'Mostrar Menos',
    'reviews.leave': 'Dejar una Reseña',
    'reviews.form.title': '¡Nos Encantaría Escucharte!',
    'reviews.form.register': 'Por favor regístrate para dejar una reseña. ¡Solo toma un momento!',
    'reviews.form.cooldown': 'Puedes dejar otra reseña en {time}. ¡Gracias por tu paciencia!',
    'reviews.form.name': 'Tu Nombre',
    'reviews.form.email': 'Tu Email',
    'reviews.form.message': 'Comparte tu experiencia...',
    'reviews.form.registerSubmit': 'Registrar y Enviar',
    'reviews.form.submit': 'Enviar Reseña',
    'reviews.form.cancel': 'Cancelar',

    // Auth generic
    'auth.login': 'Iniciar sesión',
    'auth.register': 'Registrarse',
    'reviews.auth.prompt': 'Para dejar una reseña, inicia sesión o regístrate',
    
    // FAQ
    'faq.badge': 'Preguntas',
    'faq.title': 'Preguntas Frecuentes',
    'faq.subtitle': 'Encuentra respuestas a preguntas comunes de nuestros clientes',
    'faq.showMore': 'Mostrar Más Preguntas',
    'faq.showLess': 'Mostrar Menos',
    'faq.ask': 'Hacer una Pregunta',
    'faq.form.title': '¡Estamos Aquí para Ayudar!',
    'faq.form.register': 'Por favor regístrate para hacer una pregunta. ¡Solo toma un momento!',
    'faq.form.name': 'Tu Nombre',
    'faq.form.email': 'Tu Email',
    'faq.form.question': 'Tu pregunta...',
    'faq.form.registerSubmit': 'Registrar y Enviar',
    'faq.form.submit': 'Enviar Pregunta',
    'faq.form.cancel': 'Cancelar',
    
    // Contact
    'contact.badge': 'Contacto',
    'contact.title': '¡Comencemos!',
    'contact.subtitle': '¿Listo para darle a tu auto el tratamiento que merece?',
    'contact.info.title': 'Ponte en Contacto',
    'contact.info.subtitle': 'Estamos aquí para responder tus preguntas',
    'contact.form.title': 'Envíanos un Mensaje',
    'contact.form.name': 'Tu Nombre',
    'contact.form.email': 'Tu Email',
    'contact.form.phone': 'Número de Teléfono',
    'contact.form.service': 'Servicio Necesitado',
    'contact.form.message': 'Cuéntanos sobre tu vehículo y lo que necesitas...',
    'contact.form.send': 'Enviar Mensaje',
    'contact.phone': 'Teléfono',
    'contact.email': 'Email',
    'contact.hours': 'Horario',
    'contact.hours.value': 'Lun-Sáb: 8AM - 6PM',
    'contact.location': 'Ubicación',
    'contact.quickMessage': 'Mensaje Rápido',
    'contact.submitSuccess': '¡Gracias! Te responderemos pronto.',
    'contact.form.namePlaceholder': 'Juan Pérez',
    'contact.form.emailPlaceholder': 'juan@example.com',
    'contact.form.phonePlaceholder': '+1 (916) 555-0123',
    'contact.form.messagePlaceholder': 'Cuéntanos sobre tu auto y el servicio que necesitas...',
    
    // Footer
    'footer.tagline': 'Detallado de Autos Móvil Premium',
    'footer.description': 'Llevando cuidado profesional de autos directo a tu puerta. Servicio de calidad, siempre.',
    'footer.quick': 'Enlaces Rápidos',
    'footer.services': 'Servicios',
    'footer.contact': 'Contáctanos',
    'footer.rights': 'Todos los derechos reservados.',
  },
  ru: {
    // Header
    'nav.about': 'О нас',
    'nav.portfolio': 'Портфолио',
    'nav.services': 'Услуги',
    'nav.reviews': 'Отзывы',
    'nav.faq': 'Вопросы',
    'nav.contact': 'Контакты',
    
    // Hero
    'hero.badge': 'Ваш Эксперт по Детейлингу',
    'hero.online': 'Доступен Сейчас',
    'hero.offline': 'Недоступен',
    'hero.title': 'Silans Auto Care',
    'hero.subtitle': 'Ваш Автомобиль Заслуживает Лучшего!',
    'hero.description': 'Профессиональные услуги детейлинга, которые заставляют ваш автомобиль сиять как новый. Мы возвращаем ощущение новой машины из автосалона!',
    'hero.cta.primary': 'Начать',
    'hero.cta.secondary': 'Записаться',
    'hero.click': 'Кликните чтобы увидеть больше примеров',
    
    // About
    'about.badge': 'О нас',
    'about.title': 'Страсть Встречает Точность',
    'about.subtitle': 'Ваши локальные эксперты по уходу за автомобилями в Сакраменто!',
    'about.heading': 'Делаем Автомобили Смеяться С Дня Один!',
    'about.text1': 'Добро пожаловать в наш мир автомобильного совершенства! Мы не просто еще одна автомойка - мы художники, которые относятся к каждому автомобилю как к шедевру.',
    'about.text2': 'С многолетним опытом и искренней любовью к тому, что мы делаем, мы приносим профессиональный мобильный детейлинг прямо к вашей двери. От керамических покрытий до коррекции краски, мы используем только премиальные продукты и техники.',
    'about.text3': 'Наша миссия? Сделать так, чтобы ваш автомобиль выглядел и чувствовался как новый, каждый раз. Потому что ваш автомобиль заслуживает только самого лучшего!',
    'about.stats.cars': 'Автомобилей',
    'about.stats.reviews': 'Отзывы 5 Звезд',
    'about.stats.happy': 'Счастливых',
    'about.quality': 'Качество',
    'about.quality.desc': 'Премиальные продукты & экспертный уход',
    'about.passion': 'Страсть',
    'about.passion.desc': 'Мы любим то, что делаем!',
    'about.excellence': 'Отличие',
    'about.excellence.desc': 'Отличные результаты, всегда',
    'about.happy': 'Счастливые Клиенты',
    'about.happy.desc': 'Ваше удовлетворение нас важно',
    
    // Portfolio
    'portfolio.badge': 'Наши Работы',
    'portfolio.title': 'Галерея Преображений',
    'portfolio.subtitle': 'Смотрите магию, которую мы создаем, по одному автомобилю за раз',
    'portfolio.before': 'До',
    'portfolio.after': 'После',
    'portfolio.viewMore': 'Смотреть Еще',
    'portfolio.showLess': 'Показать Меньше',
    
    // Services
    'services.badge': 'Услуги',
    'services.title': 'Что Мы Предлагаем',
    'services.subtitle': 'Премиум услуги, адаптированные к потребностям вашего автомобиля',
    'services.express.title': 'Экспресс Мойка',
    'services.express.desc': 'Быстрая внешняя мойка и сушка',
    'services.express.time': '30-45 мин',
    'services.standard.title': 'Стандартный Детейлинг',
    'services.standard.desc': 'Внешняя мойка, уборка и протирка салона',
    'services.standard.time': '1-2 часа',
    'services.premium.title': 'Премиум Детейлинг',
    'services.premium.desc': 'Глубокая чистка внутри и снаружи с восковой защитой',
    'services.premium.time': '2-3 часа',
    'services.ultimate.title': 'Максимальный Детейлинг',
    'services.ultimate.desc': 'Полное восстановление с керамическим покрытием',
    'services.ultimate.time': '4-6 часов',
    'services.interior.title': 'Глубокая Чистка Салона',
    'services.interior.desc': 'Тщательная чистка всех внутренних поверхностей',
    'services.paint.title': 'Коррекция Краски',
    'services.paint.desc': 'Удаление царапин и восстановление блеска',
    'services.ceramic.title': 'Керамическое Покрытие',
    'services.ceramic.desc': 'Долговечное защитное покрытие',
    'services.engine.title': 'Детейлинг Моторного Отсека',
    'services.engine.desc': 'Очистка и защита моторного отсека',
    
    // Reviews
    'reviews.badge': 'Отзывы',
    'reviews.title': 'Довольные Клиенты!',
    'reviews.subtitle': 'Посмотрите, что наши замечательные клиенты говорят о нас!',
    'reviews.showMore': 'Показать Больше Отзывов',
    'reviews.showLess': 'Показать Меньше',
    'reviews.leave': 'Оставить Отзыв',
    'reviews.form.title': 'Мы Хотим Услышать Вас!',
    'reviews.form.register': 'Пожалуйста, зарегистрируйтесь, чтобы оставить отзыв. Это займет всего минуту!',
    'reviews.form.cooldown': 'Вы можете оставить еще один отзыв через {time}. Спасибо за терпение!',
    'reviews.form.name': 'Ваше Имя',
    'reviews.form.email': 'Ваш Email',
    'reviews.form.message': 'Поделитесь своим опытом...',
    'reviews.form.registerSubmit': 'Зарегистрироваться и Отправить',
    'reviews.form.submit': 'Отправить Отзыв',
    'reviews.form.cancel': 'Отмена',

    // Auth generic
    'auth.login': 'Войти',
    'auth.register': 'Зарегистрироваться',
    'reviews.auth.prompt': 'Чтобы оставить отзыв, войдите или зарегистрируйтесь',
    
    // FAQ
    'faq.badge': 'Вопросы',
    'faq.title': 'Частые Вопросы',
    'faq.subtitle': 'Найдите ответы на популярные вопросы от наших клиентов',
    'faq.showMore': 'Показать Больше Вопросов',
    'faq.showLess': 'Показать Меньше',
    'faq.ask': 'Задать Вопрос',
    'faq.form.title': 'Мы Здесь, Чтобы Помочь!',
    'faq.form.register': 'Пожалуйста, зарегистрируйтесь, чтобы задать вопрос. Это займет всего минуту!',
    'faq.form.name': 'Ваше Имя',
    'faq.form.email': 'Ваш Email',
    'faq.form.question': 'Ваш вопрос...',
    'faq.form.registerSubmit': 'Зарегистрироваться и Отправить',
    'faq.form.submit': 'Отправить Вопрос',
    'faq.form.cancel': 'Отмена',
    
    // Contact
    'contact.badge': 'Контакты',
    'contact.title': 'Давайте Начнем!',
    'contact.subtitle': 'Готовы дать вашему автомобилю заслуженное обслуживание?',
    'contact.info.title': 'Свяжитесь с Нами',
    'contact.info.subtitle': 'Мы здесь, чтобы ответить на ваши вопросы',
    'contact.form.title': 'Отправьте Нам Сообщение',
    'contact.form.name': 'Ваше Имя',
    'contact.form.email': 'Ваш Email',
    'contact.form.phone': 'Номер Телефона',
    'contact.form.service': 'Необходимая Услуга',
    'contact.form.message': 'Расскажите о вашем автомобиле и что вам нужно...',
    'contact.form.send': 'Отправить Сообщение',
    'contact.phone': 'Телефон',
    'contact.email': 'Email',
    'contact.hours': 'Часы Работы',
    'contact.hours.value': 'Пн-Сб: 8:00 - 18:00',
    'contact.location': 'Местоположение',
    'contact.quickMessage': 'Быстрое Сообщение',
    'contact.submitSuccess': 'Спасибо! Мы свяжемся с вами в ближайшее время!',
    'contact.form.namePlaceholder': 'Иван Иванов',
    'contact.form.emailPlaceholder': 'ivan@example.com',
    'contact.form.phonePlaceholder': '+1 (916) 555-0123',
    'contact.form.messagePlaceholder': 'Расскажите о вашем автомобиле и нужной услуге...',
    
    // Footer
    'footer.tagline': 'Премиум Мобильный Автодетейлинг',
    'footer.description': 'Приносим профессиональный уход за автомобилем прямо к вашей двери. Качественный сервис, каждый раз.',
    'footer.quick': 'Быстрые Ссылки',
    'footer.services': 'Услуги',
    'footer.contact': 'Свяжитесь с Нами',
    'footer.rights': 'Все права защищены.',
  },
};

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('en');

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}