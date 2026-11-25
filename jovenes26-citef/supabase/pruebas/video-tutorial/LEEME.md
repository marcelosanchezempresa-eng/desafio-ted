# Video tutorial narrado (clases pendientes y Hito 1)

Se graba sobre la app de prueba, con **datos de ejemplo**.

1. **Voz:** Piper (`piper-tts`), voz `es_MX-claude-high`, length-scale 0,86. Se eligió por inteligibilidad: 96 % de palabras reconocidas, frente a 89 % de la voz `es_AR-daniela-high`.
2. **Frases:** el texto está en `narracion.json`, una frase por momento del video. Cada frase se sintetiza en `lineas/NN.wav`, y sus duraciones se guardan en `duraciones.json`.
3. **Grabación:** `grabar-video-narrado.js` graba la app (CDP screencast) esperando lo que dura cada frase. Así cada acción ocurre mientras se la nombra.
4. **Montaje:** `mezclar.py` arma el video y mezcla la voz con una música generada (`musica.py`) que baja de volumen cuando habla la voz. Salida: MP4 vertical para WhatsApp.

## Versión con voz clonada (XTTS v2)
`clonar.py` genera las mismas frases con la voz de una persona a partir de una grabación suya de 20 a 80 segundos (`voz/referencia.wav`). Usa el modelo `coqui/XTTS-v2`, con `transformers<4.56` y PyTorch para CPU. Después se copian los `.wav` a `lineas/` y se corren la grabación y `mezclar.py`.

- **Licencia:** Coqui Public Model License, solo para uso **no comercial**.
- **Privacidad:** la grabación de referencia **no se sube al repositorio**.
