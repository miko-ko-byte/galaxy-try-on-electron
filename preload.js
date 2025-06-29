const { contextBridge, ipcRenderer } = require('electron');

// Ejecutar inmediatamente al cargar el preload
(() => {
    'use strict';
    
    console.log('Preload script starting...');
    
    // PRIORITY: Interceptar Firebase y errores ANTES de DOMContentLoaded
    window.addEventListener('error', (event) => {
        if (event.error && event.error.message) {
            const message = event.error.message;
            if (message.includes('Firebase') || 
                message.includes('messaging') ||
                message.includes('FCM') ||
                message.includes('push service') ||
                message.includes('unsupported-browser') ||
                message.includes('addEventListener') ||
                message.includes('toLowerCase')) {
                console.log('Error intercepted in preload:', message);
                event.preventDefault();
                event.stopPropagation();
                return false;
            }
        }
    }, true); // Captura en fase de captura
    
    // Interceptar promise rejections
    window.addEventListener('unhandledrejection', (event) => {
        if (event.reason && event.reason.message) {
            const message = event.reason.message;
            if (message.includes('Firebase') ||
                message.includes('messaging') ||
                message.includes('FCM') ||
                message.includes('push service') ||
                message.includes('unsupported-browser')) {
                console.log('Promise rejection intercepted in preload:', message);
                event.preventDefault();
                return false;
            }
        }
    }, true);
    
    // Proteger String prototype antes de que cualquier script se ejecute
    const originalToLowerCase = String.prototype.toLowerCase;
    String.prototype.toLowerCase = function() {
        if (this == null || this === undefined) {
            console.warn('toLowerCase called on null/undefined in preload, returning empty string');
            return '';
        }
        return originalToLowerCase.call(this);
    };
    
    // Proteger otras funciones de String que podrían fallar
    const originalToUpperCase = String.prototype.toUpperCase;
    String.prototype.toUpperCase = function() {
        if (this == null || this === undefined) {
            console.warn('toUpperCase called on null/undefined, returning empty string');
            return '';
        }
        return originalToUpperCase.call(this);
    };
    
    const originalTrim = String.prototype.trim;
    String.prototype.trim = function() {
        if (this == null || this === undefined) {
            console.warn('trim called on null/undefined, returning empty string');
            return '';
        }
        return originalTrim.call(this);
    };
    
    // Interceptar console.error para suprimir errores específicos
    const originalConsoleError = console.error;
    console.error = function(...args) {
        const message = args.join(' ');
        if (message.includes('Firebase') || 
            message.includes('FCM') || 
            message.includes('messaging') ||
            message.includes('unsupported-browser')) {
            console.log('Console error suppressed:', message);
            return;
        }
        return originalConsoleError.apply(console, args);
    };
})();

// Simular APIs cuando el DOM esté listo
window.addEventListener('DOMContentLoaded', () => {
    console.log('DOMContentLoaded - Setting up PWA APIs...');
    
    // Simular BeforeInstallPromptEvent para PWAs
    class BeforeInstallPromptEvent extends Event {
        constructor() {
            super('beforeinstallprompt');
            this.platforms = ['web'];
            this.userChoice = Promise.resolve({ outcome: 'accepted', platform: 'web' });
        }
        
        prompt() {
            return Promise.resolve();
        }
    }
    
    // Simular Web Share API
    if (!navigator.share) {
        navigator.share = async (data) => {
            console.log('Web Share API simulated:', data);
            return Promise.resolve();
        };
    }
    
    // Simular Web Share Target API
    if (!navigator.canShare) {
        navigator.canShare = (data) => {
            return !!(data && (data.url || data.text || data.title));
        };
    }
    
    // Simular Clipboard API si no existe
    if (!navigator.clipboard) {
        navigator.clipboard = {
            writeText: async (text) => {
                console.log('Clipboard write simulated:', text);
                return Promise.resolve();
            },
            readText: async () => {
                console.log('Clipboard read simulated');
                return Promise.resolve('');
            },
            write: async (data) => {
                console.log('Clipboard write (complex) simulated:', data);
                return Promise.resolve();
            },
            read: async () => {
                console.log('Clipboard read (complex) simulated');
                return Promise.resolve([]);
            }
        };
    }
    
    // Simular Wake Lock API
    if (!navigator.wakeLock) {
        navigator.wakeLock = {
            request: async (type) => {
                console.log('Wake Lock requested:', type);
                return Promise.resolve({
                    released: false,
                    type: type,
                    release: () => {
                        console.log('Wake Lock released');
                        return Promise.resolve();
                    },
                    addEventListener: () => {},
                    removeEventListener: () => {}
                });
            }
        };
    }
    
    // Simular Battery API
    if (!navigator.getBattery) {
        navigator.getBattery = async () => {
            return Promise.resolve({
                charging: true,
                chargingTime: Infinity,
                dischargingTime: Infinity,
                level: 0.8,
                addEventListener: () => {},
                removeEventListener: () => {},
                onchargingchange: null,
                onchargingtimechange: null,
                ondischargingtimechange: null,
                onlevelchange: null
            });
        };
    }
    
    // Mejorar Network Information API
    if (!navigator.connection && !navigator.mozConnection && !navigator.webkitConnection) {
        Object.defineProperty(navigator, 'connection', {
            value: {
                effectiveType: '4g',
                type: 'cellular',
                downlink: 10,
                rtt: 50,
                saveData: false,
                addEventListener: () => {},
                removeEventListener: () => {},
                onchange: null
            },
            writable: false,
            configurable: false
        });
    }
    
    // Mejorar Geolocation con manejo de errores
    if (navigator.geolocation) {
        const originalGetCurrentPosition = navigator.geolocation.getCurrentPosition;
        const originalWatchPosition = navigator.geolocation.watchPosition;
        
        navigator.geolocation.getCurrentPosition = function(success, error, options) {
            // Simular ubicación en República Dominicana por defecto
            const position = {
                coords: {
                    latitude: 18.4861,
                    longitude: -69.9312,
                    altitude: null,
                    accuracy: 10,
                    altitudeAccuracy: null,
                    heading: null,
                    speed: null
                },
                timestamp: Date.now()
            };
            
            try {
                if (success && typeof success === 'function') {
                    setTimeout(() => success(position), 100);
                }
            } catch (err) {
                console.log('Geolocation success callback error:', err);
                if (error && typeof error === 'function') {
                    error({
                        code: 1,
                        message: 'User denied geolocation'
                    });
                }
            }
        };
        
        navigator.geolocation.watchPosition = function(success, error, options) {
            // Simular watch position
            const position = {
                coords: {
                    latitude: 18.4861,
                    longitude: -69.9312,
                    altitude: null,
                    accuracy: 10,
                    altitudeAccuracy: null,
                    heading: null,
                    speed: null
                },
                timestamp: Date.now()
            };
            
            const watchId = Math.random();
            
            try {
                if (success && typeof success === 'function') {
                    setTimeout(() => success(position), 100);
                }
            } catch (err) {
                console.log('Geolocation watch success callback error:', err);
            }
            
            return watchId;
        };
    }
    
    // Simular Media Devices API
    if (navigator.mediaDevices) {
        if (!navigator.mediaDevices.getUserMedia) {
            navigator.mediaDevices.getUserMedia = async (constraints) => {
                console.log('getUserMedia simulated with constraints:', constraints);
                throw new DOMException('Permission denied', 'NotAllowedError');
            };
        }
        
        if (!navigator.mediaDevices.enumerateDevices) {
            navigator.mediaDevices.enumerateDevices = async () => {
                console.log('enumerateDevices simulated');
                return Promise.resolve([]);
            };
        }
        
        if (!navigator.mediaDevices.getDisplayMedia) {
            navigator.mediaDevices.getDisplayMedia = async (constraints) => {
                console.log('getDisplayMedia simulated');
                throw new DOMException('Permission denied', 'NotAllowedError');
            };
        }
    }
    
    // Simular Push API (para prevenir errores)
    if (!window.PushManager) {
        window.PushManager = class MockPushManager {
            static get supportedContentEncodings() {
                return [];
            }
            
            subscribe() {
                return Promise.reject(new Error('Push messaging not supported in Electron'));
            }
            
            getSubscription() {
                return Promise.resolve(null);
            }
            
            permissionState() {
                return Promise.resolve('denied');
            }
        };
    }
    
    // Agregar eventos personalizados para PWA
    setTimeout(() => {
        const appInstalledEvent = new Event('appinstalled');
        window.dispatchEvent(appInstalledEvent);
        console.log('appinstalled event dispatched');
    }, 1500);
    
    console.log('Preload script executed - PWA APIs simulated');
});

// Exponer APIs de Electron de forma segura
contextBridge.exposeInMainWorld('electronAPIs', {
    // APIs que podrías necesitar
    openExternal: (url) => ipcRenderer.invoke('open-external', url),
    showNotification: (title, body) => ipcRenderer.invoke('show-notification', { title, body }),
    platform: process.platform,
    versions: process.versions
});