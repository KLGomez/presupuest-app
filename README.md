# 📒 Planner de Gastos Mensuales

> Organizá tus finanzas personales con estilo — un tablero visual e intuitivo para el control mensual de gastos.

---

## 📌 ¿Qué es esta aplicación?

**Planner de Gastos Mensuales** es una aplicación web de gestión financiera personal diseñada con una estética de cuaderno/planner analógico.

A diferencia de las típicas apps de finanzas con interfaces frías y corporativas, esta herramienta propone una experiencia más visual, cálida y amigable — pensada para quienes disfrutan organizar sus finanzas de forma clara y ordenada.

**Problema que resuelve:**
- ¿No sabés a dónde se va tu dinero cada mes?
- ¿Olvidás vencimientos de servicios y pagos fijos?
- ¿Necesitás visualizar rápido cómo se distribuye tu presupuesto?

Esta app te da un lugar centralizado para registrar, clasificar y anticipar todos tus gastos.

---

## ✨ Características principales

| Funcionalidad | Descripción |
|---|---|
| 💸 **Registro de gastos** | Registrá gastos con monto, categoría, tipo y fecha |
| 🗂️ **Clasificación por categorías** | Organizá por Vivienda, Alimentación, Transporte, y más |
| 📅 **Calendario de vencimientos** | Visualizá vencimientos en un calendario mensual interactivo |
| 🔄 **Conversión de vencimientos** | Convertí un vencimiento directamente en un gasto registrado |
| 💾 **Persistencia local** | Todos los datos se guardan automáticamente en `localStorage` por mes |
| 📊 **Gráfico de distribución** | Visualizá la distribución de gastos con un gráfico de dona en colores pastel |
| 🔇 **Control de sonido** | Efectos de sonido sutiles con opción de silenciar |

---

## 🛠️ Tecnologías utilizadas

- ⚛️ **React 19** — UI declarativa con hooks y Context API
- 🎨 **Tailwind CSS v4** — Estilos utilitarios sin CSS customizado
- 🎬 **Framer Motion** — Animaciones fluidas y transiciones
- 🔊 **Web Audio API** — Efectos de sonido generados en el navegador
- 🗓️ **Lucide React** — Íconos limpios y consistentes
- 💾 **localStorage** — Persistencia de datos por mes sin backend

---

## 🖼️ Capturas de pantalla

> *Próximamente.*

```
[ 📊 Tablero ]   [ 📝 Planificación ]   [ 📅 Calendario ]
```

---

## 🚀 Instalación y uso

### Requisitos previos
- Node.js 18 o superior
- npm 9 o superior

### Pasos

```bash
# 1. Clonar el repositorio
git clone https://github.com/tu-usuario/presupuest-app.git

# 2. Entrar al directorio
cd presupuest-app

# 3. Instalar dependencias
npm install

# 4. Iniciar el servidor de desarrollo
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`

---

## 📁 Estructura del proyecto

```
src/
├── components/
│   ├── Calendar.jsx        # Calendario de vencimientos
│   ├── Dashboard.jsx       # Vista principal del tablero
│   ├── BudgetPlanner.jsx   # Planificación por categorías
│   ├── ExpenseTracker.jsx  # Formulario y lista de gastos
│   ├── Almanac.jsx         # Widget compacto de vencimientos
│   ├── Header.jsx          # Cabecera con navegación de meses
│   └── ui/
│       └── NoteCard.jsx    # Tarjeta estilo cuaderno
├── context/
│   ├── PlannerContext.jsx  # Estado global y persistencia
│   └── SoundContext.jsx    # Control de audio
└── utils/
    ├── constants.js        # Categorías y tipos de gasto
    └── formatters.js       # Formateo de moneda
```

---

## 📈 Estado del proyecto

> 🟢 **Activo** — Funcional y en mejora continua.

- [x] Registro y clasificación de gastos
- [x] Planificación presupuestaria por categoría
- [x] Calendario de vencimientos con indicadores visuales
- [x] Conversión de vencimientos a gastos reales
- [x] Persistencia mensual automática
- [x] Diseño responsive
- [ ] Exportación a CSV/PDF
- [ ] Soporte multi-moneda
- [ ] Modo oscuro

---

## 👩‍💻 Autoría

Desarrollado por **Katherine Gómez**   
📅 2026

---

<div align="center">
  <sub>Hecho con ☕ y muchas ganas de organizar las finanzas.</sub>
</div>
