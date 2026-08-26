# Sinergia Design System v1.0

Guía completa de diseño y componentes para mantener consistencia visual en toda la app.

---

## 📋 Tabla de Contenidos
1. [Colores](#colores)
2. [Tipografía](#tipografía)
3. [Espaciado](#espaciado)
4. [Componentes](#componentes)
5. [Animaciones](#animaciones)
6. [Accesibilidad](#accesibilidad)

---

## 🎨 Colores

### Primarios
```css
--ds-primary: #0052CC;        /* Azul principal */
--ds-primary-light: #3B82F6;  /* Azul claro */
--ds-primary-dark: #003D99;   /* Azul oscuro */
```

### Secundarios
```css
--ds-secondary: #7C3AED;      /* Púrpura */
--ds-secondary-light: #A78BFA;
```

### Accent
```css
--ds-accent: #FF6B35;         /* Naranja energético */
--ds-accent-light: #FFA562;
```

### Semánticos
```css
--ds-success: #10B981;        /* Verde éxito */
--ds-warning: #F59E0B;        /* Amarillo alerta */
--ds-danger: #EF4444;         /* Rojo error */
```

### Neutrales (Escala de grises)
```
--ds-gray-50 (#F9FAFB) → --ds-gray-900 (#111827)
Usar para fondos, bordes y textos
```

### Uso en HTML
```html
<!-- Clase directa -->
<div class="bg-primary">Fondo azul primario</div>

<!-- Variable CSS -->
<div style="color: var(--ds-primary);">Texto azul</div>

<!-- En CSS -->
.mi-elemento {
  color: var(--ds-primary);
  background: var(--ds-gray-100);
}
```

---

## 📝 Tipografía

### Font Family
```css
--ds-font-family: 'Plus Jakarta Sans', -apple-system, ...
--ds-font-mono: 'Monaco', 'Menlo', ...
```

### Tamaños (Scale)
```css
--ds-text-xs: 0.75rem (12px)
--ds-text-sm: 0.875rem (14px)
--ds-text-base: 1rem (16px)
--ds-text-lg: 1.125rem (18px)
--ds-text-xl: 1.25rem (20px)
--ds-text-2xl: 1.5rem (24px)
--ds-text-3xl: 1.875rem (30px)
--ds-text-4xl: 2.25rem (36px)
--ds-text-5xl: 3rem (48px)
```

### Pesos
```css
--ds-font-weight-light: 300
--ds-font-weight-regular: 400
--ds-font-weight-medium: 500
--ds-font-weight-semibold: 600
--ds-font-weight-bold: 700
--ds-font-weight-extrabold: 800
```

### Headings
```html
<h1 class="h1">Título 1 (3rem, extrabold)</h1>
<h2 class="h2">Título 2 (2.25rem, bold)</h2>
<h3 class="h3">Título 3 (1.875rem, bold)</h3>
<h4 class="h4">Título 4 (1.5rem, semibold)</h4>

<!-- Clases de tamaño -->
<p class="text-sm">Pequeño (14px)</p>
<p class="text-lg">Grande (18px)</p>

<!-- Clases de peso -->
<p class="font-light">Light 300</p>
<p class="font-bold">Bold 700</p>
```

---

## 📏 Espaciado

```css
--ds-spacing-1: 0.25rem (4px)
--ds-spacing-2: 0.5rem (8px)
--ds-spacing-3: 0.75rem (12px)
--ds-spacing-4: 1rem (16px)
--ds-spacing-5: 1.25rem (20px)
--ds-spacing-6: 1.5rem (24px)
--ds-spacing-8: 2rem (32px)
--ds-spacing-10: 2.5rem (40px)
--ds-spacing-12: 3rem (48px)
--ds-spacing-16: 4rem (64px)
```

### Uso
```html
<!-- Padding -->
<div class="p-4">Padding 1rem</div>
<div class="p-6">Padding 1.5rem</div>

<!-- Margin -->
<div class="m-2">Margin 0.5rem</div>

<!-- Gap (flexbox/grid) -->
<div class="gap-4">Gap 1rem entre items</div>

<!-- En CSS -->
.elemento {
  padding: var(--ds-spacing-4);
  margin: var(--ds-spacing-2);
  gap: var(--ds-spacing-6);
}
```

---

## 🛠️ Componentes

### Botones
```html
<!-- Primario -->
<button class="btn-primary">Acción principal</button>

<!-- Secundario -->
<button class="btn-secondary">Acción secundaria</button>

<!-- Accent (Naranja) -->
<button class="btn-accent">Acción destacada</button>

<!-- Ghost (Outline) -->
<button class="btn-ghost">Acción auxiliar</button>

<!-- Disabled -->
<button class="btn-primary" disabled>Deshabilitado</button>
```

### Inputs
```html
<input type="text" placeholder="Ingresa texto">
<input type="email" placeholder="Correo">
<textarea placeholder="Mensaje largo"></textarea>
<select>
  <option>Opción 1</option>
</select>
```

### Cards
```html
<!-- Card básica -->
<div class="card">Contenido</div>

<!-- Card elevada (sombra más fuerte) -->
<div class="card card-elevated">Contenido importante</div>
```

### Badges
```html
<span class="badge badge-primary">Primario</span>
<span class="badge badge-success">Éxito</span>
<span class="badge badge-warning">Alerta</span>
<span class="badge badge-danger">Error</span>
```

---

## ✨ Animaciones

### Transiciones predefinidas
```css
--ds-transition-fast: 150ms ease-out
--ds-transition-base: 200ms ease-out
--ds-transition-slow: 300ms ease-out
```

### Clases de animación
```html
<!-- Desliza y aparece -->
<div class="animate-in">Contenido</div>

<!-- Fade in -->
<div class="animate-fade">Contenido</div>
```

### Uso personalizado
```css
.mi-elemento {
  transition: all var(--ds-transition-base);
}

.mi-elemento:hover {
  transform: translateY(-2px);
  box-shadow: var(--ds-shadow-lg);
}
```

---

## ♿ Accesibilidad

### Ocultar texto visualmente pero mantenerlo para lectores de pantalla
```html
<span class="sr-only">Información adicional para screen readers</span>
```

### Contraste mínimo
- Texto normal: Ratio 4.5:1 (WCAG AA)
- Texto grande: Ratio 3:1

### Focus visible
Todos los elementos interactivos tienen estados de focus claros:
```css
input:focus {
  outline: none;
  border-color: var(--ds-primary);
  box-shadow: 0 0 0 3px rgba(0, 82, 204, 0.1);
}
```

### Semantic HTML
```html
<button>Acción</button>    <!-- NO <div onclick> -->
<a href="">Enlace</a>      <!-- Para navegación -->
<nav></nav>                <!-- Navegación principal -->
<main></main>              <!-- Contenido principal -->
```

---

## 📱 Responsive

### Breakpoints
```css
Mobile: 320px
Tablet: 768px
Desktop: 1024px
Wide: 1280px
Ultra: 1536px
```

### Mobile-First Approach
```css
/* Base: Mobile (320px) */
.elemento { font-size: 1rem; }

/* Tablet y más */
@media (min-width: 768px) {
  .elemento { font-size: 1.25rem; }
}

/* Desktop y más */
@media (min-width: 1024px) {
  .elemento { font-size: 1.5rem; }
}
```

---

## 🌙 Dark Mode

El sistema detecta `prefers-color-scheme: dark` automáticamente:

```css
@media (prefers-color-scheme: dark) {
  :root {
    --ds-gray-900: #F9FAFB;
    --ds-gray-800: #F3F4F6;
  }
}
```

---

## 📊 Sombras

```css
--ds-shadow-sm: Muy ligera
--ds-shadow-base: Sombra normal
--ds-shadow-md: Media
--ds-shadow-lg: Grande
--ds-shadow-xl: Extra grande
```

### Uso
```html
<div class="shadow">Sombra normal</div>
<div class="shadow-lg">Sombra grande</div>

<div style="box-shadow: var(--ds-shadow-xl);">Sombra XL</div>
```

---

## 🔄 Gradientes

```css
Gradient primario: linear-gradient(135deg, #0052CC 0%, #7C3AED 100%)
Gradient accent: linear-gradient(135deg, #FF6B35 0%, #FFA562 100%)
Gradient success: linear-gradient(135deg, #10B981 0%, #6EE7B7 100%)
```

---

## 📌 Ejemplo completo

```html
<div class="card p-6 gap-4 rounded-xl shadow">
  <h2 class="h2 font-bold">Título</h2>
  <p class="text-lg text-muted">Descripción con texto muted</p>
  
  <div class="flex gap-4">
    <button class="btn-primary">Primario</button>
    <button class="btn-ghost">Secundario</button>
  </div>
  
  <span class="badge badge-success">Éxito</span>
</div>
```

---

## 🚀 Guía de implementación

1. **Siempre usar variables CSS** — No hardcodear colores
2. **Respetar espaciado** — Usar múltiplos de 4px
3. **Constancia en tipografía** — Usar escala definida
4. **Animaciones sutiles** — Máximo 300ms
5. **Mobile-first** — Diseñar para mobile primero
6. **Accesibilidad** — Focus visible, contraste, semantic HTML

---

**Última actualización:** 2026-08-26  
**Versión:** 1.0
