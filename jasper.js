// Función para log de errores estilizado
function logError(proceso, error, color = '#ff4757') {
  const styles = {
    container: `
      background: linear-gradient(135deg, ${color}20, ${color}10);
      border-left: 4px solid ${color};
      padding: 12px 16px;
      margin: 8px 0;
      border-radius: 6px;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    `,
    titulo: `
      color: ${color};
      font-weight: bold;
      font-size: 14px;
      margin-bottom: 8px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    `,
    proceso: `
      color: #2c3e50;
      font-weight: 600;
      font-size: 13px;
      margin-bottom: 6px;
    `,
    error: `
      color: #e74c3c;
      font-family: 'Courier New', monospace;
      font-size: 12px;
      background: #fff5f5;
      padding: 8px;
      border-radius: 4px;
      border: 1px solid #fed7d7;
    `
  };

  console.group(`%c❌ ERROR DETECTADO`, styles.titulo);
  console.log(`%c🔧 Proceso: ${proceso}`, styles.proceso);
  console.log(`%c💥 Error: ${error}`, styles.error);
  console.groupEnd();
}

// Versión más avanzada con diferentes tipos de log
function styledLog(tipo, proceso, mensaje, detalles = null) {
  const tipos = {
    error: {
      emoji: '❌',
      color: '#e74c3c',
      bg: '#fff5f5',
      border: '#fed7d7'
    },
    warning: {
      emoji: '⚠️',
      color: '#f39c12',
      bg: '#fffbf0',
      border: '#feebc8'
    },
    success: {
      emoji: '✅',
      color: '#27ae60',
      bg: '#f0fff4',
      border: '#c6f6d5'
    },
    info: {
      emoji: 'ℹ️',
      color: '#3498db',
      bg: '#f0f8ff',
      border: '#bee3f8'
    }
  };

  const config = tipos[tipo] || tipos.info;
  
  const styles = {
    header: `
      background: linear-gradient(135deg, ${config.color}20, ${config.color}10);
      color: ${config.color};
      font-weight: bold;
      padding: 8px 12px;
      border-radius: 6px 6px 0 0;
      border-left: 4px solid ${config.color};
      font-size: 13px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    `,
    proceso: `
      background: #f8f9fa;
      color: #2c3e50;
      font-weight: 600;
      padding: 6px 12px;
      border-left: 4px solid ${config.color};
      font-size: 12px;
    `,
    mensaje: `
      background: ${config.bg};
      color: #2c3e50;
      padding: 10px 12px;
      border-left: 4px solid ${config.color};
      border-bottom: 1px solid ${config.border};
      font-family: 'Courier New', monospace;
      font-size: 11px;
      border-radius: 0 0 6px 6px;
    `
  };

  console.log(`%c${config.emoji} ${tipo.toUpperCase()}`, styles.header);
  console.log(`%c🔧 ${proceso}`, styles.proceso);
  console.log(`%c${mensaje}`, styles.mensaje);
  
  if (detalles) {
    console.log('📋 Detalles adicionales:', detalles);
  }
  console.log(''); // Línea en blanco para separar
}

// Ejemplos de uso:

// Ejemplo básico
/*
logError('Validación de formulario', 'El campo email es requerido', '#e74c3c');

// Ejemplos con la versión avanzada
styledLog('error', 'Conexión API', 'No se pudo conectar al servidor', {
  status: 500,
  url: 'https://api.ejemplo.com/datos',
  timestamp: new Date().toISOString()
});

styledLog('warning', 'Validación de datos', 'Algunos campos están vacíos', {
  camposVacios: ['nombre', 'telefono']
});

styledLog('success', 'Guardado de datos', 'Los datos se guardaron correctamente');

styledLog('info', 'Carga de página', 'Inicializando componentes...');

// Función específica para errores de red
function logNetworkError(url, status, mensaje) {
  styledLog('error', 'Error de Red', `${status} - ${mensaje}`, {
    url: url,
    timestamp: new Date().toLocaleString(),
    userAgent: navigator.userAgent.substring(0, 50) + '...'
  });
}

// Ejemplo de error de red
logNetworkError('https://api.ejemplo.com/usuarios', 404, 'Recurso no encontrado');*/
console.clear()
styledLog('Jasper!', 'preparando...', 'El injector de codigo esta preparando los tweaks...');