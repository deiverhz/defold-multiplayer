# Defold Multiplayer Backend

Backend multijugador Defold usando WebSockets.

## Deploy en Render.com

1. Conecta tu repositorio de GitHub a Render
2. Render detectará automáticamente el `render.yaml`
3. El servicio se desplegará automáticamente

## Configuración en Defold

En tu juego Defold, necesitarás:

1. Conectarte al WebSocket del servidor
2. Enviar updates periódicamente
3. Sincronizar los datos

### URL de conexión:
- Desarrollo: `ws://localhost:3000`
- Producción: `https://tuapp.onrender.com`
