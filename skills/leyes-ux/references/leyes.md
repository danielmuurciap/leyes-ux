# Las 30 leyes

Texto propio. Cada ley cita su fuente original y enlaza a su página en
[lawsofux.com](https://lawsofux.com/es/), de Jon Yablonski, que es de donde sale
esta selección de 30.

Esto es el **corpus**. Para decidir, usa las tablas del `SKILL.md`: leer las 30
seguidas no cambia ninguna decisión.

Cada ley tiene tres partes: **qué dice**, **qué decide en una interfaz** y
**cuidado**, que es cómo se malinterpreta.

---

## Percepción y agrupación (Gestalt): cómo se lee una pantalla

### Ley de proximidad
**Qué dice.** Lo que está cerca se percibe como un grupo. — Wertheimer, 1923.
**En una interfaz.** El espacio es el primer agrupador, antes que bordes o
colores. Deja más espacio entre grupos que dentro de ellos: la etiqueta pegada a
su campo, no a medio camino entre dos.
**Cuidado.** Con el mismo espaciado en todas partes desaparece la estructura.
→ [lawsofux](https://lawsofux.com/es/ley-de-proximidad/)

### Ley de región común
**Qué dice.** Lo que comparte un contorno o un fondo se percibe como un grupo,
aunque esté más lejos que otra cosa. — Palmer, 1992.
**En una interfaz.** Tarjetas, paneles, filas con fondo. Sirve cuando el espacio
no basta para separar.
**Cuidado.** Cada borde añade un nivel. Una tarjeta dentro de otra tarjeta
dentro de un panel es ruido; si el espacio ya agrupa, el borde sobra.
→ [lawsofux](https://lawsofux.com/es/ley-de-regi%C3%B3n-com%C3%BAn/)

### Ley de semejanza
**Qué dice.** Lo que se parece (color, forma, tamaño) se percibe como
relacionado, aunque esté separado. — Wertheimer, 1923.
**En una interfaz.** Mismo estilo, misma función. Un enlace tiene que parecer
enlace y distinguirse del texto normal.
**Cuidado.** Un texto con el color del botón parece pulsable. Reutilizar un
estilo para algo que funciona distinto crea una promesa falsa.
→ [lawsofux](https://lawsofux.com/es/ley-de-la-semejanza/)

### Ley de conectividad uniforme
**Qué dice.** Lo que está unido por una línea o un marco se percibe más
relacionado que lo que solo está cerca o se parece. — Palmer y Rock, 1994.
**En una interfaz.** Pasos de un proceso, líneas de tiempo, un campo unido a su
ayuda.
**Cuidado.** Una línea decorativa conecta cosas que no tienen relación.
→ [lawsofux](https://lawsofux.com/es/ley-de-conectividad-uniforme/)

### Ley de Prägnanz
**Qué dice.** Ante algo ambiguo, se ve la forma más simple posible, porque es la
que menos esfuerzo cuesta. — Wertheimer y Koffka, psicología de la Gestalt.
**En una interfaz.** Iconos y composiciones simples se reconocen antes. Alinear
a una rejilla hace que la pantalla se lea como un todo.
**Cuidado.** Un icono demasiado abstracto se simplifica en otra cosa.
→ [lawsofux](https://lawsofux.com/es/ley-de-pr%C3%A4gnanz/)

---

## Atención y memoria: cuánto cabe en la cabeza

### Carga cognitiva
**Qué dice.** Una tarea exige recursos mentales limitados. Parte los pide la
propia tarea (carga intrínseca) y parte la añade cómo se presenta (extrínseca).
— Sweller, 1988.
**En una interfaz.** La intrínseca no se puede quitar; la extrínseca sí:
decoración, texto repetido, decisiones que el sistema podría tomar solo.
**Cuidado.** Esconderlo todo no reduce la carga si luego hay que ir a buscarlo.
→ [lawsofux](https://lawsofux.com/es/carga-cognitiva/)

### Memoria de trabajo
**Qué dice.** Retenemos muy poca información nueva a la vez (unos 4 fragmentos) y
durante poco tiempo. — Baddeley y Hitch, 1974; Cowan, 2001.
**En una interfaz.** Que recuerde el sistema. Muestra el dato del paso anterior
en vez de pedir que se recuerde; no obligues a copiar un código de una pantalla
a otra. Reconocer cuesta menos que recordar.
**Cuidado.** Cualquier cosa que el usuario tenga que apuntar en un papel es un
fallo de diseño.
→ [lawsofux](https://lawsofux.com/es/la-memoria-de-trabajo/)

### Ley de Miller
**Qué dice.** La memoria inmediata retiene en torno a 7 ± 2 elementos. — Miller,
1956.
**En una interfaz.** Agrupa lo que haya que recordar, no solo lo que haya que
ver.
**Cuidado.** No es un límite de elementos para un menú o una lista visible: lo
que se ve entero no se memoriza, se recorre con la vista. Usar «el número
mágico» para recortar opciones útiles es el error más común con esta ley.
→ [lawsofux](https://lawsofux.com/es/ley-de-miller/)

### Fragmentación
**Qué dice.** Agrupar piezas sueltas en unidades con sentido permite retener y
procesar más. — Miller, 1956.
**En una interfaz.** Un teléfono en bloques, un IBAN de 4 en 4, un contenido
largo en secciones con título que se pueden recorrer por encima.
**Cuidado.** Si el campo muestra el dato en bloques, tiene que aceptarlo también
sin espacios (Postel).
→ [lawsofux](https://lawsofux.com/es/fragmentaci%C3%B3n/)

### Atención selectiva
**Qué dice.** Atendemos solo a una parte de lo que tenemos delante, la que tiene
que ver con lo que buscamos. — Broadbent, 1958. Casos conocidos: ceguera al
banner (Benway y Lane, 1998) y ceguera al cambio (Simons y Levin, 1997).
**En una interfaz.** Lo que parece un anuncio se ignora aunque sea importante.
Un cambio en una zona a la que no se mira pasa desapercibido: señálalo donde
está la atención.
**Cuidado.** Animar algo para llamar la atención compite con la tarea.
→ [lawsofux](https://lawsofux.com/es/atenci%C3%B3n-selectiva/)

### Efecto de posición en serie
**Qué dice.** De una serie se recuerdan mejor el primer y el último elemento. —
Ebbinghaus, 1885; Murdock, 1962.
**En una interfaz.** Acciones clave en los extremos de la navegación; lo
secundario en medio.
**Cuidado.** En una lista donde se busca algo concreto, el orden lo decide la
búsqueda (alfabético, reciente), no la memoria.
→ [lawsofux](https://lawsofux.com/es/efecto-de-posici%C3%B3n-en-serie/)

### Efecto Von Restorff
**Qué dice.** Entre varios elementos parecidos, se recuerda el que es distinto.
— Von Restorff, 1933.
**En una interfaz.** La acción principal destaca y el acento se raciona.
**Cuidado.** Si todo destaca, nada destaca. El color no puede ser la única
diferencia (WCAG 1.4.1). Si la diferencia es movimiento, respeta a quien ha
pedido reducirlo.
→ [lawsofux](https://lawsofux.com/es/efecto-von-restorff/)

---

## Decisión: cuánto cuesta elegir

### Ley de Hick
**Qué dice.** El tiempo para decidir crece con el número de opciones, de forma
logarítmica. — Hick, 1952; Hyman, 1953.
**En una interfaz.** Menos opciones cuando el tiempo importa. Marca la
recomendada. Divide una decisión grande en pasos.
**Cuidado.** Habla de elegir entre opciones que hay que comparar, no de
encontrar algo conocido en una lista ordenada. Recortar de más obliga a dar más
pasos y el total empeora.
→ [lawsofux](https://lawsofux.com/es/ley-de-hick/)

### Sobrecarga de opciones
**Qué dice.** Demasiadas opciones pueden bloquear la decisión y empeorar la
satisfacción con lo elegido. — Toffler, 1970; Iyengar y Lepper, 2000.
**En una interfaz.** Filtros, una opción recomendada, comparación lado a lado.
**Cuidado.** El efecto no aparece siempre: un metaanálisis (Scheibehenne,
Greifeneder y Todd, 2010) encontró un efecto medio cercano a cero. Depende de si
el usuario sabe lo que quiere. En configuración busca una opción concreta y
esconderlas le estorba.
→ [lawsofux](https://lawsofux.com/es/sobrecarga-de-opciones/)

### Navaja de Occam
**Qué dice.** Entre explicaciones que funcionan igual, la que necesita menos
supuestos. — Guillermo de Ockham, siglo XIV.
**En una interfaz.** Entre dos diseños que resuelven lo mismo, el de menos
piezas. Se quita hasta que quitar algo rompe la función.
**Cuidado.** Menos piezas no es más claro si lo que se quita es la etiqueta y
queda un icono que nadie entiende.
→ [lawsofux](https://lawsofux.com/es/la-navaja-de-occam/)

### Ley de Tesler (conservación de la complejidad)
**Qué dice.** Todo proceso tiene una complejidad que no se puede eliminar, solo
cambiar de sitio: la asume el sistema o la asume el usuario. — Larry Tesler,
pionero de la interfaz gráfica en Xerox PARC y Apple.
**En una interfaz.** Que la asuma el sistema: valores por defecto, autocompletar,
detectar el formato, recordar lo último.
**Cuidado.** Esconder la complejidad sin resolverla la traslada al usuario más
tarde, normalmente en forma de error.
→ [lawsofux](https://lawsofux.com/es/ley-de-tesler/)

### Principio de Pareto
**Qué dice.** En muchos sistemas, una minoría de causas produce la mayoría de los
efectos; la forma habitual de decirlo es 80/20. — Pareto, 1896; Juran.
**En una interfaz.** Optimiza primero los flujos que usa casi todo el mundo; lo
raro puede ir un nivel más adentro.
**Cuidado.** 80/20 describe una forma, no una proporción exacta. Lo que usa la
minoría puede ser crítico, como la accesibilidad.
→ [lawsofux](https://lawsofux.com/es/principio-de-pareto/)

---

## Expectativa: lo que el usuario ya cree saber

### Ley de Jakob
**Qué dice.** Los usuarios pasan la mayor parte de su tiempo en otros productos,
así que esperan que el tuyo funcione como esos. — Nielsen, 2000.
**En una interfaz.** Patrones conocidos para lo que no es tu producto:
navegación, formularios, carrito, búsqueda. Pestañas para cambiar de vista.
**Cuidado.** Innova en lo que te diferencia, no en dónde está el botón de
cerrar. Si cambias un patrón conocido, deja un tiempo la versión anterior.
→ [lawsofux](https://lawsofux.com/es/ley-de-jakob/)

### Modelo mental
**Qué dice.** Cada persona usa una idea simplificada de cómo funciona un sistema
y la aplica a lo que se le parece. — Craik, 1943; Norman, 1983.
**En una interfaz.** Nombres y agrupaciones del usuario, no la estructura de la
base de datos ni el organigrama de la empresa.
**Cuidado.** Tu modelo mental no es el del usuario. Se descubre investigando, no
suponiendo.
→ [lawsofux](https://lawsofux.com/es/modelo-mental/)

### Ley de Postel (principio de robustez)
**Qué dice.** Sé tolerante con lo que recibes y estricto con lo que envías. —
Jon Postel, especificaciones de TCP/IP, 1980.
**En una interfaz.** Acepta el teléfono con espacios, la fecha en varios
formatos, el código pegado con un espacio al final. Normaliza tú y enseña cómo
ha quedado.
**Cuidado.** Aceptar algo ambiguo sin decir cómo se ha interpretado (¿01/02 es
enero o febrero?) cambia un error visible por uno silencioso.
→ [lawsofux](https://lawsofux.com/es/ley-de-postel/)

### Paradoja del usuario activo
**Qué dice.** Los usuarios no leen instrucciones: empiezan a usar el producto ya,
aunque aprenderlo antes les ahorraría tiempo. — Carroll y Rosson, 1987.
**En una interfaz.** La ayuda va dentro del flujo y en el momento en que hace
falta: una pista junto al campo, un valor por defecto que enseña.
**Cuidado.** Un tour de bienvenida de seis pasos se salta entero.
→ [lawsofux](https://lawsofux.com/es/paradoja-del-usuario-activo/)

### Sesgo cognitivo
**Qué dice.** El juicio comete errores sistemáticos, no aleatorios, porque usa
atajos para ahorrar esfuerzo. — Tversky y Kahneman, 1974.
**En una interfaz.** Anclaje en precios, efecto marco en cómo se presenta una
opción, y el sesgo de confirmación del propio equipo al leer la investigación.
**Cuidado.** Usar un sesgo contra el interés del usuario es un patrón oscuro.
→ [lawsofux](https://lawsofux.com/es/sesgo-cognitivo/)

---

## Tiempo y motivación: cómo se siente la espera

### Umbral de Doherty
**Qué dice.** La productividad se dispara cuando el sistema responde en menos de
400 ms, porque ninguno de los dos espera al otro. — Doherty y Thadani, IBM, 1982.
**En una interfaz.** Feedback inmediato tras cada acción: estado pulsado, botón
deshabilitado mientras envía, skeleton, actualización optimista. Barra de
progreso si va a tardar más de un segundo.
**Cuidado.** Los 400 ms son para la respuesta visible, no para que termine la
operación.
→ [lawsofux](https://lawsofux.com/es/umbral-de-doherty/)

### Ley de Parkinson
**Qué dice.** El trabajo se expande hasta ocupar todo el tiempo disponible. —
C. Northcote Parkinson, 1955.
**En una interfaz.** Haz que la tarea dure menos de lo que el usuario espera:
autocompletar, rellenar con lo que ya se sabe, pagar en un paso.
**Cuidado.** Una cuenta atrás artificial («quedan 2 minutos») es presión, no
ayuda.
→ [lawsofux](https://lawsofux.com/es/ley-de-parkinson/)

### Efecto Zeigarnik
**Qué dice.** Las tareas interrumpidas o sin terminar se recuerdan mejor que las
terminadas. — Zeigarnik, 1927.
**En una interfaz.** Enseña lo que falta: un perfil al 60 %, una lista de pasos
pendientes, una señal de que hay más contenido.
**Cuidado.** Las réplicas del experimento dan resultados desiguales. Y un aviso
de pendientes que nunca se vacía genera ansiedad, no motivación.
→ [lawsofux](https://lawsofux.com/es/efecto-zeigarnik/)

### Efecto de tendencia a la meta
**Qué dice.** El esfuerzo aumenta a medida que la meta se acerca. — Hull, 1932;
Kivetz, Urminsky y Zheng, 2006.
**En una interfaz.** Enseña cuánto falta. Empezar con parte del progreso hecho
(la tarjeta que regala los dos primeros sellos) aumenta cuántos terminan.
**Cuidado.** Un progreso que retrocede o que era falso rompe la confianza.
→ [lawsofux](https://lawsofux.com/es/efecto-de-tendencia-a-la-meta/)

### Fluir
**Qué dice.** Hay un estado de concentración plena que aparece cuando la
dificultad está a la altura de la habilidad. — Csikszentmihalyi, 1975.
**En una interfaz.** Feedback continuo de qué se ha hecho, nada que interrumpa
sin motivo (modales, confirmaciones de más) y atajos para quien ya domina.
**Cuidado.** Lo que para un experto es fluir, para un novato es un muro.
→ [lawsofux](https://lawsofux.com/es/fluir/)

### Regla del pico y el final
**Qué dice.** Una experiencia se juzga por su momento más intenso y por cómo
termina, no por la media. — Kahneman, Fredrickson, Schreiber y Redelmeier, 1993.
**En una interfaz.** Cuida el remate (la confirmación, el éxito) y el peor
momento posible (el error).
**Cuidado.** Lo negativo pesa más. Un final bonito no compensa un error que hizo
perder datos.
→ [lawsofux](https://lawsofux.com/es/regla-de-fin-de-pico/)

---

## Estética y precisión

### Efecto estética-usabilidad
**Qué dice.** Lo que resulta agradable a la vista se percibe como más fácil de
usar. — Kurosu y Kashimura, 1995.
**En una interfaz.** El acabado suma confianza y hace que se toleren mejor los
fallos pequeños.
**Cuidado.** Esconde problemas en las pruebas: la gente dice que le gusta y
falla la tarea. Mide tareas completadas, no opiniones.
→ [lawsofux](https://lawsofux.com/es/efecto-de-est%C3%A9tica-usabilidad/)

### Ley de Fitts
**Qué dice.** El tiempo para alcanzar un objetivo depende de lo lejos que está y
de lo grande que es. — Fitts, 1954.
**En una interfaz.** Objetivos grandes, separados entre sí y cerca de donde ya
está el dedo o el cursor. En táctil, ≥ 44 px (WCAG 2.5.5 y Apple); el mínimo AA
es 24 px (WCAG 2.5.8). En escritorio, los bordes de la pantalla son objetivos
fáciles porque el cursor no se pasa.
**Cuidado.** La zona pulsable puede ser mayor que lo que se dibuja: un icono de
20 px con relleno hasta 44 px cumple.
→ [lawsofux](https://lawsofux.com/es/ley-de-fitts/)
