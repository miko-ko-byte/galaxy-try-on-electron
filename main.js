const { app, BrowserWindow, session } = require('electron/main')
const path = require('node:path')
const fs = require("fs")
const JASPER = "./jasper.js"

function createWindow() {
    // Configurar session antes de crear la ventana
    session.defaultSession.webRequest.onBeforeSendHeaders((details, callback) => {
        // Simular headers de PWA instalada
        details.requestHeaders['User-Agent'] = 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1';
        details.requestHeaders['Sec-Fetch-Site'] = 'same-origin';
        details.requestHeaders['Sec-Fetch-Mode'] = 'navigate';
        details.requestHeaders['Sec-Fetch-Dest'] = 'document';
        
        callback({ cancel: false, requestHeaders: details.requestHeaders });
    });

    const win = new BrowserWindow({
        width: 412,
        height: 915,
        // Simular ventana de PWA instalada
       // titleBarStyle: 'hidden',
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: false,
            contextIsolation: true,
            webSecurity: true,
            userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1'
        }
    })

    // Cargar con los parámetros correctos del manifest
    win.loadURL("https://eslatam.trygalaxy.com/?redirect=false&fullscreen=true")
    
    // Inyectar código para simular PWA instalada
    win.webContents.once('did-finish-load', () => {
        // Simular entorno de PWA instalada ANTES que cualquier otro script
        win.webContents.executeJavaScript(`
            // PRIORITY: Interceptar Firebase ANTES de que se inicialice
            (function() {
                'use strict';
                
                // Interceptar y deshabilitar Firebase messaging completamente
                const originalDefineProperty = Object.defineProperty;
                const originalGetOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;
                
                // Interceptar todas las definiciones de propiedades relacionadas con Firebase
                Object.defineProperty = function(obj, prop, descriptor) {
                    if (typeof prop === 'string' && (
                        prop.includes('firebase') || 
                        prop.includes('messaging') || 
                        prop.includes('FCM') ||
                        prop === 'serviceWorker'
                    )) {
                        console.log('Blocked Firebase property definition:', prop);
                        return obj;
                    }
                    return originalDefineProperty.call(this, obj, prop, descriptor);
                };
                
                // Interceptar window.firebase antes de que se defina
                let _firebase = null;
                Object.defineProperty(window, 'firebase', {
                    get: function() {
                        return _firebase;
                    },
                    set: function(value) {
                        console.log('Firebase assignment intercepted');
                        if (value && typeof value === 'object') {
                            // Crear un proxy que deshabilite messaging
                            _firebase = new Proxy(value, {
                                get: function(target, prop) {
                                    if (prop === 'messaging') {
                                        return function() {
                                            throw new Error('Firebase messaging disabled in Electron');
                                        };
                                    }
                                    if (prop === 'analytics') {
                                        return function() {
                                            return {
                                                logEvent: () => {},
                                                setUserProperties: () => {},
                                                setUserId: () => {}
                                            };
                                        };
                                    }
                                    return target[prop];
                                }
                            });
                        } else {
                            _firebase = value;
                        }
                    },
                    configurable: true,
                    enumerable: true
                });
            })();
            
            // ARREGLAR: Propiedades de navigator ANTES de cualquier script
            const userAgentString = 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1';
            const platformString = 'iPhone';
            
            // Redefinir navigator properties de forma más robusta
            Object.defineProperties(navigator, {
                userAgent: {
                    value: userAgentString,
                    writable: false,
                    configurable: false,
                    enumerable: true
                },
                platform: {
                    value: platformString,
                    writable: false,
                    configurable: false,
                    enumerable: true
                },
                appVersion: {
                    value: '5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1',
                    writable: false,
                    configurable: false,
                    enumerable: true
                },
                standalone: {
                    value: true,
                    writable: false,
                    configurable: false,
                    enumerable: true
                },
                maxTouchPoints: {
                    value: 5,
                    writable: false,
                    configurable: false,
                    enumerable: true
                }
            });
            
            // Arreglar el problema de toLowerCase() en undefined
            const originalToLowerCase = String.prototype.toLowerCase;
            String.prototype.toLowerCase = function() {
                if (this == null || this === undefined) {
                    console.warn('toLowerCase called on null/undefined, returning empty string');
                    return '';
                }
                return originalToLowerCase.call(this);
            };
            
            // Interceptar errores globales antes de que ocurran
            const originalAddEventListener = EventTarget.prototype.addEventListener;
            EventTarget.prototype.addEventListener = function(type, listener, options) {
                if (type === 'error' || type === 'unhandledrejection') {
                    const wrappedListener = function(event) {
                        // Interceptar errores de Firebase
                        if (event.error && event.error.message) {
                            if (event.error.message.includes('Firebase') ||
                                event.error.message.includes('messaging') ||
                                event.error.message.includes('FCM') ||
                                event.error.message.includes('push service') ||
                                event.error.message.includes('unsupported-browser')) {
                                console.log('Firebase error intercepted and suppressed:', event.error.message);
                                event.preventDefault();
                                event.stopPropagation();
                                return false;
                            }
                            // Interceptar errores de toLowerCase
                            if (event.error.message.includes('toLowerCase')) {
                                console.log('toLowerCase error intercepted');
                                event.preventDefault();
                                event.stopPropagation();
                                return false;
                            }
                        }
                        if (event.reason && event.reason.message) {
                            if (event.reason.message.includes('Firebase') ||
                                event.reason.message.includes('messaging') ||
                                event.reason.message.includes('FCM')) {
                                console.log('Firebase promise rejection intercepted:', event.reason.message);
                                event.preventDefault();
                                return false;
                            }
                        }
                        return listener.call(this, event);
                    };
                    return originalAddEventListener.call(this, type, wrappedListener, options);
                }
                return originalAddEventListener.call(this, type, listener, options);
            };
            
            // Interceptar service worker registration de forma más efectiva
            if ('serviceWorker' in navigator) {
                const originalRegister = navigator.serviceWorker.register;
                navigator.serviceWorker.register = async function(scriptURL, options) {
                    try {
                        const registration = await originalRegister.call(this, scriptURL, options);
                        
                        // Deshabilitar pushManager completamente
                        if (registration.pushManager) {
                            Object.defineProperty(registration, 'pushManager', {
                                value: {
                                    subscribe: () => Promise.reject(new Error('Push messaging not supported in Electron')),
                                    getSubscription: () => Promise.resolve(null),
                                    permissionState: () => Promise.resolve('denied'),
                                    supportedContentEncodings: []
                                },
                                writable: false,
                                configurable: false
                            });
                        }
                        
                        return registration;
                    } catch (error) {
                        console.log('Service worker registration handled:', error.message);
                        throw error;
                    }
                };
                
                // Interceptar addEventListener del service worker
                const originalSWAddEventListener = navigator.serviceWorker.addEventListener;
                if (originalSWAddEventListener) {
                    navigator.serviceWorker.addEventListener = function(type, listener, options) {
                        if (type === 'message') {
                            const wrappedListener = function(event) {
                                // Filtrar mensajes de Firebase
                                if (event.data && (
                                    event.data.type === 'FCM_MESSAGE' ||
                                    event.data.firebaseMessaging ||
                                    (typeof event.data === 'string' && event.data.includes('firebase'))
                                )) {
                                    console.log('Firebase service worker message blocked');
                                    return;
                                }
                                return listener.call(this, event);
                            };
                            return originalSWAddEventListener.call(this, type, wrappedListener, options);
                        }
                        return originalSWAddEventListener.call(this, type, listener, options);
                    };
                }
            }
            
            // Simular Notification API más robustamente
            if (!window.Notification || true) { // Forzar override
                window.Notification = class MockNotification {
                    constructor(title, options = {}) {
                        console.log('Electron Notification:', title, options);
                        this.title = title;
                        this.body = options.body || '';
                        this.icon = options.icon || '';
                        this.tag = options.tag || '';
                        this.data = options.data || null;
                        
                        // Simular eventos
                        setTimeout(() => {
                            if (this.onshow) this.onshow();
                        }, 100);
                    }
                    
                    static requestPermission() {
                        return Promise.resolve('granted');
                    }
                    
                    static get permission() {
                        return 'granted';
                    }
                    
                    close() {
                        if (this.onclose) this.onclose();
                    }
                    
                    addEventListener(type, listener) {
                        this['on' + type] = listener;
                    }
                    
                    removeEventListener(type, listener) {
                        this['on' + type] = null;
                    }
                };
                
                // Propiedades estáticas
                Object.defineProperty(window.Notification, 'permission', {
                    value: 'granted',
                    writable: false
                });
            }
            
            // Simular display mode standalone más efectivamente
            const originalMatchMedia = window.matchMedia;
            window.matchMedia = function(query) {
                if (query === '(display-mode: standalone)') {
                    return {
                        matches: true,
                        media: query,
                        addListener: () => {},
                        removeListener: () => {},
                        addEventListener: () => {},
                        removeEventListener: () => {},
                        dispatchEvent: () => true
                    };
                }
                if (query === '(display-mode: browser)') {
                    return {
                        matches: false,
                        media: query,
                        addListener: () => {},
                        removeListener: () => {},
                        addEventListener: () => {},
                        removeEventListener: () => {},
                        dispatchEvent: () => true
                    };
                }
                return originalMatchMedia ? originalMatchMedia.call(this, query) : { matches: false, media: query };
            };
            
            // Simular orientación móvil
            Object.defineProperty(screen, 'orientation', {
                value: {
                    angle: 0,
                    type: 'portrait-primary',
                    lock: () => Promise.resolve(),
                    unlock: () => Promise.resolve(),
                    addEventListener: () => {},
                    removeEventListener: () => {}
                },
                writable: false,
                configurable: false
            });
            
            // Simular resolución móvil iPhone
            Object.defineProperties(screen, {
                width: { value: 375, writable: false, configurable: false },
                height: { value: 667, writable: false, configurable: false },
                availWidth: { value: 375, writable: false, configurable: false },
                availHeight: { value: 647, writable: false, configurable: false }
            });
            
            // Simular pixel ratio de iPhone
            Object.defineProperty(window, 'devicePixelRatio', {
                value: 3,
                writable: false,
                configurable: false
            });
            
            // Simular conexión móvil
            Object.defineProperty(navigator, 'connection', {
                value: {
                    effectiveType: '4g',
                    type: 'cellular',
                    downlink: 10,
                    rtt: 50,
                    saveData: false,
                    addEventListener: () => {},
                    removeEventListener: () => {}
                },
                writable: false,
                configurable: false
            });
            
            // Simular vibration API
            if (!navigator.vibrate) {
                navigator.vibrate = function(pattern) {
                    console.log('Vibration simulated:', pattern);
                    return true;
                };
            }
            
            // Simular que el Service Worker está registrado
            console.log('Service Worker support detected');
            
            // Simular Web App Manifest
            const manifestLink = document.querySelector('link[rel="manifest"]');
            if (!manifestLink) {
                const link = document.createElement('link');
                link.rel = 'manifest';
                link.href = '/manifest_124.json';
                document.head.appendChild(link);
            }
            
            // Simular getInstalledRelatedApps
            Object.defineProperty(navigator, 'getInstalledRelatedApps', {
                value: function() {
                    return Promise.resolve([{
                        id: 'com.trygalaxy.app',
                        platform: 'webapp',
                        url: 'https://eslatam.trygalaxy.com/'
                    }]);
                },
                writable: false,
                configurable: false
            });
            
            // Agregar clase CSS para indicar que es standalone
            document.documentElement.classList.add('standalone');
            document.documentElement.classList.add('mobile-app');
            
            // Simular viewport móvil
            let viewportMeta = document.querySelector('meta[name="viewport"]');
            if (!viewportMeta) {
                viewportMeta = document.createElement('meta');
                viewportMeta.name = 'viewport';
                document.head.appendChild(viewportMeta);
            }
            viewportMeta.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover';
            
            // Simular theme-color
            let themeColorMeta = document.querySelector('meta[name="theme-color"]');
            if (!themeColorMeta) {
                themeColorMeta = document.createElement('meta');
                themeColorMeta.name = 'theme-color';
                themeColorMeta.content = '#000000';
                document.head.appendChild(themeColorMeta);
            }
            
            // Dispatch evento para indicar que la app está lista
            setTimeout(() => {
                window.dispatchEvent(new Event('appinstalled'));
            }, 500);
            
            console.log('PWA environment simulated successfully');
            console.log('Display mode:', window.matchMedia('(display-mode: standalone)').matches ? 'standalone' : 'browser');
            console.log('User Agent:', navigator.userAgent);
            console.log('Platform:', navigator.platform);
            console.log('Screen:', screen.width + 'x' + screen.height);
            console.log('Standalone:', navigator.standalone);
        `);
        
        // Ejecutar jasper.js DESPUÉS de la simulación
        if (fs.existsSync(JASPER)) {
            setTimeout(() => {
                win.webContents.executeJavaScript(fs.readFileSync(JASPER, 'utf8'));
            }, 2000); // Aumentar el delay
        }
        
        // Abrir DevTools en desarrollo
        if (1) {
            win.webContents.openDevTools({
                mode: 'detach'
            });
        }
    });
    
    // Manejar errores de navegación
    win.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
        console.error('Failed to load:', errorCode, errorDescription);
    });
    
    // Interceptar nuevas ventanas para mantenerlas en la misma ventana
    win.webContents.setWindowOpenHandler(({ url }) => {
        win.loadURL(url);
        return { action: 'deny' };
    });
    
    // Interceptar errores de renderer
    win.webContents.on('crashed', (event, killed) => {
        console.error('Renderer crashed:', killed);
    });
    
    win.webContents.on('unresponsive', () => {
        console.error('Renderer became unresponsive');
    });
}

app.whenReady().then(() => {
    createWindow()

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow()
        }
    })
})

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
})