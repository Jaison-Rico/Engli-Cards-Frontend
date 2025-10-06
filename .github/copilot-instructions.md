
## Reglas y convenciones adicionales (para agentes y contribuidores)

Las siguientes reglas deben aplicarse siempre al trabajar en este repositorio. Están redactadas en español para mayor claridad y son de cumplimiento obligatorio para cambios automatizados por agentes:

- Utiliza siempre la tabulación para formatear el código.
- Prioriza siempre soluciones simples.
- Después de realizar cambios, SIEMPRE asegúrate de iniciar un nuevo servidor para que puedan probarse (si aplica).
- Mata siempre todos los servidores relacionados que hayan sido creados en pruebas anteriores antes de iniciar un nuevo servidor.
- Busca siempre código existente para iterar en lugar de crear nuevo código desde cero.
- Evita la duplicación de código cuando sea posible; revisa si ya existe lógica similar.
- Escribe código que tenga en cuenta los entornos: desarrollo, pruebas y producción.
- Asegúrate de hacer solo los cambios solicitados o aquellos en los que tengas plena confianza y relación con la solicitud.
- Al corregir un bug, no introduzcas un nuevo patrón o tecnología sin agotar las opciones con la implementación actual; si lo haces, elimina la implementación anterior.
- Mantén la base de código limpia y bien organizada.
- Evita escribir scripts directamente en archivos si es posible (especialmente si son de un solo uso).
- Documenta siempre tu código, aunque sea con comentarios breves que expliquen la intención.
- Usa nombres de variables, funciones y clases descriptivos y claros.
- Antes de subir cambios, asegúrate de pasar todas las pruebas unitarias y de integración.
- Haz commits pequeños y frecuentes, con mensajes claros y significativos.
- Mantén consistencia en el estilo de código (nomenclatura, formato, patrones).
- Antes de eliminar código, valida que no sea usado por otro módulo o proceso oculto.
- Revisa siempre dependencias externas: elimina las que no uses y mantén actualizadas las necesarias.
- Divide el código en funciones o módulos pequeños y reutilizables.
- No expongas información sensible (contraseñas, tokens, claves API) en el código ni en los commits.
- Implementa logs claros y útiles que permitan rastrear errores en los diferentes entornos.
- Siempre revisa que las variables de entorno estén correctamente configuradas según el entorno (dev, test, prod).
- Utiliza revisiones de código (code review) siempre que sea posible antes de integrar cambios.
- Asegúrate de manejar errores y excepciones en todas las capas críticas del sistema.
- Usa control de versiones responsablemente: nunca subas cambios directamente a la rama principal sin revisión o pruebas.
- Optimiza el rendimiento, pero no sacrifiques legibilidad por micro-optimizaciones innecesarias.

Si deseas, puedo traducir estas reglas al inglés o integrarlas en el checklist de PRs y pipelines.
