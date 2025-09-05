# Defold Multiplayer Backend

Backend multijugador para juego de plataformas Defold usando WebSockets.

## Deploy en Render.com

1. Conecta tu repositorio de GitHub a Render
2. Render detectará automáticamente el `render.yaml`
3. El servicio se desplegará automáticamente

## Configuración en Defold

En tu juego Defold, necesitarás:

1. Conectarte al WebSocket del servidor
2. Enviar updates de posición periódicamente
3. Sincronizar recolección de llaves y apertura de candados

### URL de conexión:
- Desarrollo: `ws://localhost:3000`
- Producción: `wss://tu-app.render.com`