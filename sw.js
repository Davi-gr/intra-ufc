/**
 * Service Worker para INTRA UFC (PWA)
 * Garante carregamento instantâneo offline dos arquivos estáticos e mapa,
 * enquanto mantém o sinal de GPS do ônibus sempre em tempo real.
 */

const CACHE_NAME = "intra-ufc-v5";

const ASSETS_APP_SHELL = [
	"./",
	"index.html",
	"manifest.webmanifest",
	"css/global.css",
	"css/components.css",
	"css/responsive.css",
	"js/data.js",
	"js/main.js",
	"icons/icon.svg",
	"icons/icon-192.png",
	"icons/icon-512.png",
	"https://unpkg.com/leaflet@1.9.4/dist/leaflet.css",
	"https://unpkg.com/leaflet@1.9.4/dist/leaflet.js",
];

// 1. Instalação: Pré-cache dos arquivos essenciais
self.addEventListener("install", (event) => {
	event.waitUntil(
		caches.open(CACHE_NAME).then((cache) => {
			return cache.addAll(ASSETS_APP_SHELL);
		}).then(() => self.skipWaiting())
	);
});

// 2. Ativação: Limpeza de caches antigos
self.addEventListener("activate", (event) => {
	event.waitUntil(
		caches.keys().then((keys) => {
			return Promise.all(
				keys.map((key) => {
					if (key !== CACHE_NAME) {
						return caches.delete(key);
					}
				})
			);
		}).then(() => self.clients.claim())
	);
});

// 3. Interceptação de requisições
self.addEventListener("fetch", (event) => {
	const url = new URL(event.request.url);

	// Rastreamento ao vivo: NUNCA usar cache (sempre direto da rede)
	if (url.pathname.includes("/ao-vivo") || url.pathname.includes("/onibus/ao-vivo")) {
		event.respondWith(
			fetch(event.request).catch(() => {
				return new Response(
					JSON.stringify({
						visivel: false,
						motivo: "Você está offline. Conecte-se à internet para rastrear o ônibus em tempo real.",
						onibus: [],
					}),
					{ headers: { "Content-Type": "application/json" } }
				);
			})
		);
		return;
	}

	// Azulejos do mapa (OpenStreetMap): Estratégia Stale-While-Revalidate
	if (url.hostname.includes("tile.openstreetmap.org")) {
		event.respondWith(
			caches.open("intra-map-tiles").then(async (tileCache) => {
				const cachedResponse = await tileCache.match(event.request);
				const fetchPromise = fetch(event.request).then((networkResponse) => {
					if (networkResponse.status === 200) {
						tileCache.put(event.request, networkResponse.clone());
					}
					return networkResponse;
				}).catch(() => null);

				return cachedResponse || fetchPromise;
			})
		);
		return;
	}

	// Arquivos estáticos do App: Cache-First com fallback para rede
	event.respondWith(
		caches.match(event.request).then((cachedResponse) => {
			if (cachedResponse) {
				return cachedResponse;
			}
			return fetch(event.request).then((networkResponse) => {
				if (
					event.request.method === "GET" &&
					networkResponse &&
					networkResponse.status === 200 &&
					!url.protocol.startsWith("chrome-extension")
				) {
					const responseToCache = networkResponse.clone();
					caches.open(CACHE_NAME).then((cache) => {
						cache.put(event.request, responseToCache);
					});
				}
				return networkResponse;
			});
		})
	);
});

