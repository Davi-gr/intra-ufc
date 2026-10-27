/**
 * Lógica principal da aplicação INTRA UFC (PWA & Mobile-First).
 * Controla o mapa interativo, rotas, paradas, rastreamento do ônibus,
 * geolocalização do usuário e instalação do PWA.
 */

// ==========================================================================
// 1. Registro do Service Worker (PWA)
// ==========================================================================
if ("serviceWorker" in navigator) {
	window.addEventListener("load", () => {
		navigator.serviceWorker
			.register("sw.js")
			.then((reg) => {
				console.log("Service Worker do INTRA UFC registrado com sucesso:", reg.scope);
			})
			.catch((err) => {
				console.warn("Falha ao registrar Service Worker:", err);
			});
	});
}

// ==========================================================================
// 1. Registro do Service Worker & Instalação PWA
// ==========================================================================
if ("serviceWorker" in navigator) {
	window.addEventListener("load", () => {
		navigator.serviceWorker
			.register("sw.js")
			.then((reg) => {
				console.log("Service Worker do INTRA UFC registrado com sucesso:", reg.scope);
			})
			.catch((err) => {
				console.warn("Falha ao registrar Service Worker:", err);
			});
	});
}

// Suporte à instalação em todas as plataformas (com atenção especial ao iOS/iPhone)
let promptInstalacao = null;
const btnInstalar = document.getElementById("pwa-install-btn");
const modalInstalacao = document.getElementById("pwa-install-modal");
const modalBody = document.getElementById("pwa-modal-body");
const modalCloseBtn = document.getElementById("pwa-modal-close");

// Detecção avançada de Web App instalado
const urlParams = new URLSearchParams(window.location.search);
if (urlParams.get("origem") === "pwa") {
	localStorage.setItem("intra_pwa_instalado", "true");
}

const isStandalone =
	window.matchMedia("(display-mode: standalone)").matches ||
	window.navigator.standalone === true ||
	urlParams.get("origem") === "pwa" ||
	localStorage.getItem("intra_pwa_instalado") === "true";

const isIOS =
	/iphone|ipad|ipod/i.test(navigator.userAgent) ||
	(navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);

// Se detectado como Web App instalado, REMOVE completamente o botão de instalar
if (isStandalone) {
	localStorage.setItem("intra_pwa_instalado", "true");
	if (btnInstalar) {
		btnInstalar.remove();
	}
} else if (btnInstalar) {
	btnInstalar.hidden = false;
}

window.addEventListener("beforeinstallprompt", (evento) => {
	evento.preventDefault();
	promptInstalacao = evento;
	if (btnInstalar && !isStandalone) {
		btnInstalar.hidden = false;
	}
});

function abrirModalInstalacao() {
	if (!modalInstalacao || !modalBody) return;

	if (isIOS) {
		// Instruções específicas e visuais para iPhone / iPad (Safari)
		modalBody.innerHTML = `
			<ul class="pwa-step-list">
				<li class="pwa-step-item">
					<span class="pwa-step-num">1</span>
					<span>Toque no botão de <strong>Compartilhar</strong> <span class="ios-icon-badge">⎋</span> (ícone com quadrado e seta para cima no rodapé do Safari).</span>
				</li>
				<li class="pwa-step-item">
					<span class="pwa-step-num">2</span>
					<span>Role as opções para baixo e toque em <strong>"Adicionar à Tela de Início"</strong> <span class="ios-icon-badge">➕</span>.</span>
				</li>
				<li class="pwa-step-item">
					<span class="pwa-step-num">3</span>
					<span>Toque em <strong>"Adicionar"</strong> no canto superior direito para finalizar.</span>
				</li>
			</ul>
			<button class="pwa-modal-btn-action" type="button" id="pwa-modal-entendido">Entendi</button>
			<button class="pwa-modal-btn-subtle" type="button" id="pwa-modal-ja-adicionei">Já adicionei à tela de início</button>
		`;
	} else {
		// Outros navegadores sem o evento nativo disparado
		modalBody.innerHTML = `
			<p style="color: var(--color-ink); margin-bottom: 1rem; line-height: 1.4;">
				Para instalar o aplicativo no seu dispositivo:
			</p>
			<ul class="pwa-step-list">
				<li class="pwa-step-item">
					<span class="pwa-step-num">1</span>
					<span>Abra o menu do seu navegador (três pontinhos no canto superior).</span>
				</li>
				<li class="pwa-step-item">
					<span class="pwa-step-num">2</span>
					<span>Selecione <strong>"Instalar aplicativo"</strong> ou <strong>"Adicionar à tela inicial"</strong>.</span>
				</li>
			</ul>
			<button class="pwa-modal-btn-action" type="button" id="pwa-modal-entendido">Entendi</button>
			<button class="pwa-modal-btn-subtle" type="button" id="pwa-modal-ja-adicionei">Já adicionei à tela de início</button>
		`;
	}

	modalInstalacao.hidden = false;

	const btnEntendido = document.getElementById("pwa-modal-entendido");
	if (btnEntendido) {
		btnEntendido.addEventListener("click", () => {
			modalInstalacao.hidden = true;
		});
	}

	const btnJaAdicionei = document.getElementById("pwa-modal-ja-adicionei");
	if (btnJaAdicionei) {
		btnJaAdicionei.addEventListener("click", () => {
			localStorage.setItem("intra_pwa_instalado", "true");
			if (btnInstalar) btnInstalar.remove();
			modalInstalacao.hidden = true;
		});
	}
}

if (btnInstalar) {
	btnInstalar.addEventListener("click", async () => {
		// 1. Se o navegador suportar o prompt nativo automático (Android / Chrome Desktop)
		if (promptInstalacao) {
			promptInstalacao.prompt();
			const resultado = await promptInstalacao.userChoice;
			if (resultado.outcome === "accepted") {
				localStorage.setItem("intra_pwa_instalado", "true");
				btnInstalar.remove();
			}
			promptInstalacao = null;
			return;
		}

		// 2. No iPhone (iOS) ou navegadores onde a instalação é manual
		abrirModalInstalacao();
	});
}

if (modalCloseBtn && modalInstalacao) {
	modalCloseBtn.addEventListener("click", () => {
		modalInstalacao.hidden = true;
	});

	// Fechar ao clicar no fundo escuro
	modalInstalacao.addEventListener("click", (e) => {
		if (e.target === modalInstalacao) {
			modalInstalacao.hidden = true;
		}
	});
}

window.addEventListener("appinstalled", () => {
	localStorage.setItem("intra_pwa_instalado", "true");
	if (btnInstalar) btnInstalar.remove();
	if (modalInstalacao) modalInstalacao.hidden = true;
	console.log("App INTRA UFC instalado com sucesso!");
});

// ==========================================================================
// 2. Gestão de Avisos e Menu Superior
// ==========================================================================
const navBtnMapa = document.getElementById("nav-btn-mapa");
const navBtnAvisos = document.getElementById("nav-btn-avisos");
const avisosBadge = document.getElementById("avisos-badge");
const avisosPopover = document.getElementById("avisos-popover");
const avisosCloseBtn = document.getElementById("avisos-close-btn");
const avisosListContainer = document.getElementById("avisos-list-container");

let avisosAtivos = [...(INTRA_DATA.avisos || [])];

function renderizarAvisos() {
	if (!avisosListContainer) return;

	if (avisosBadge) {
		if (avisosAtivos.length > 0) {
			avisosBadge.textContent = avisosAtivos.length;
			avisosBadge.hidden = false;
		} else {
			avisosBadge.hidden = true;
		}
	}

	if (avisosAtivos.length === 0) {
		// Quando não há nenhum aviso
		avisosListContainer.innerHTML = `
			<div class="avisos-empty-state">
				<div class="avisos-empty-icon" aria-hidden="true">✓</div>
				<h4 class="avisos-empty-title">Nenhum aviso no momento</h4>
				<p class="avisos-empty-desc">
					O transporte intracampus da UFC Sobral está operando normalmente em todas as rotas e horários previstos.
				</p>
			</div>
		`;
		return;
	}

	// Renderizar cards de avisos
	avisosListContainer.innerHTML = avisosAtivos
		.map((aviso) => {
			const tipo = aviso.tipo || "info";
			const labelTipo = tipo === "urgente" ? "Urgente" : tipo === "alerta" ? "Atenção" : "Informativo";
			return `
				<article class="aviso-card ${tipo}">
					<div class="aviso-card-meta">
						<span class="aviso-card-tag">${labelTipo}</span>
						<span class="aviso-card-date">${aviso.data || "Recente"}</span>
					</div>
					<h4 class="aviso-card-title">${aviso.titulo}</h4>
					<p class="aviso-card-message">${aviso.mensagem}</p>
				</article>
			`;
		})
		.join("");
}

function abrirAvisos() {
	renderizarAvisos();
	if (avisosPopover) avisosPopover.hidden = false;
	if (navBtnAvisos) {
		navBtnAvisos.classList.add("active");
		navBtnAvisos.setAttribute("aria-expanded", "true");
	}
	if (navBtnMapa) navBtnMapa.classList.remove("active");
}

function fecharAvisos() {
	if (avisosPopover) avisosPopover.hidden = true;
	if (navBtnAvisos) {
		navBtnAvisos.classList.remove("active");
		navBtnAvisos.setAttribute("aria-expanded", "false");
	}
	if (navBtnMapa) navBtnMapa.classList.add("active");
}

if (navBtnAvisos) {
	navBtnAvisos.addEventListener("click", () => {
		if (avisosPopover && !avisosPopover.hidden) {
			fecharAvisos();
		} else {
			abrirAvisos();
		}
	});
}

if (navBtnMapa) {
	navBtnMapa.addEventListener("click", () => {
		fecharAvisos();
	});
}

if (avisosCloseBtn) {
	avisosCloseBtn.addEventListener("click", () => {
		fecharAvisos();
	});
}

if (avisosPopover) {
	avisosPopover.addEventListener("click", (e) => {
		if (e.target === avisosPopover) {
			fecharAvisos();
		}
	});
}

// Inicializar renderização dos avisos
renderizarAvisos();

// ==========================================================================
// 2. Inicialização do Mapa Leaflet
// ==========================================================================
const map = L.map("map", {
	zoomControl: false, // reposicionaremos para melhorar ergonomia no mobile
}).setView(
	[INTRA_DATA.centro.lat, INTRA_DATA.centro.lng],
	INTRA_DATA.centro.zoom
);

// Zoom control no topo direito para não colidir com os botões flutuantes da mão direita
L.control.zoom({ position: "topright" }).addTo(map);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
	maxZoom: 19,
	attribution: "&copy; OpenStreetMap contributors",
}).addTo(map);

// ==========================================================================
// 3. Traçado das Rotas de Ida e Volta
// ==========================================================================
const rotaIdaLayer = L.polyline(INTRA_DATA.rotas.ida.coordenadas, {
	color: INTRA_DATA.rotas.ida.cor,
	weight: INTRA_DATA.rotas.ida.peso,
	opacity: INTRA_DATA.rotas.ida.opacidade,
})
	.addTo(map)
	.bindPopup(`<strong>${INTRA_DATA.rotas.ida.nome}</strong>`);

const rotaVoltaLayer = L.polyline(INTRA_DATA.rotas.volta.coordenadas, {
	color: INTRA_DATA.rotas.volta.cor,
	weight: INTRA_DATA.rotas.volta.peso,
	opacity: INTRA_DATA.rotas.volta.opacidade,
})
	.addTo(map)
	.bindPopup(`<strong>${INTRA_DATA.rotas.volta.nome}</strong>`);

// ==========================================================================
// 4. Renderização das Paradas e Painel Lateral
// ==========================================================================
const marcadoresParadas = {};
const stopsListEl = document.getElementById("stops-list");

INTRA_DATA.paradas.forEach((parada, index) => {
	const stopIcon = L.divIcon({
		className: "custom-stop-marker-wrapper",
		html: `<div class="custom-stop-marker">${index + 1}</div>`,
		iconSize: [22, 22],
		iconAnchor: [11, 11],
		popupAnchor: [0, -12],
	});

	const marker = L.marker([parada.lat, parada.lng], { icon: stopIcon })
		.addTo(map)
		.bindPopup(`
			<div style="font-family: var(--font-body); padding: 2px;">
				<strong style="color: var(--color-ink); font-size: 0.95rem;">${parada.nome}</strong>
				<p style="margin: 4px 0 0; color: var(--color-muted); font-size: 0.8rem;">Parada #${index + 1} do Intracampus UFC</p>
			</div>
		`, { autoPanPadding: [20, 85], maxWidth: 260 });

	marcadoresParadas[parada.id] = marker;

	if (stopsListEl) {
		const li = document.createElement("li");
		const button = document.createElement("button");
		button.type = "button";
		button.innerHTML = `<span><span class="stop-dot"></span>${parada.nome}</span><small style="color:#94a3b8">#${index + 1}</small>`;
		button.addEventListener("click", () => {
			map.flyTo([parada.lat, parada.lng], 16, { duration: 1.2 });
			marker.openPopup();
			// No mobile, fecha a gaveta ao selecionar uma parada para exibir o mapa livre
			if (window.innerWidth < 768 && stopsPanelEl) {
				stopsPanelEl.classList.remove("expanded");
			}
		});
		li.appendChild(button);
		stopsListEl.appendChild(li);
	}
});

// Controle da Gaveta (Bottom Sheet) no Mobile
const stopsPanelEl = document.getElementById("stops-panel");
const drawerToggleEl = document.getElementById("drawer-toggle");
const stopsPanelHeader = document.querySelector(".stops-panel-header");

function alternarGavetaParadas() {
	if (stopsPanelEl && window.innerWidth < 768) {
		stopsPanelEl.classList.toggle("expanded");
	}
}

if (drawerToggleEl) {
	drawerToggleEl.addEventListener("click", alternarGavetaParadas);
}

if (stopsPanelHeader) {
	stopsPanelHeader.addEventListener("click", alternarGavetaParadas);
}

// Ao tocar no mapa, recolhe a gaveta se ela estiver aberta no celular
map.on("click", () => {
	if (stopsPanelEl && stopsPanelEl.classList.contains("expanded") && window.innerWidth < 768) {
		stopsPanelEl.classList.remove("expanded");
	}
});

// ==========================================================================
// 5. Rastreamento do Ônibus em Tempo Real (com Ícone Vetorial SVG)
// ==========================================================================
const busIcon = L.divIcon({
	className: "custom-bus-marker-wrapper",
	html: `<div class="custom-bus-marker" title="Ônibus Intracampus">
		<svg viewBox="-20 -10 280 280" width="22" height="22" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
			<rect x="2" y="210" width="16" height="36" rx="8" fill="#0f172a"/>
			<rect x="222" y="210" width="16" height="36" rx="8" fill="#0f172a"/>
			<rect x="10" y="20" width="220" height="215" rx="36" fill="#ffffff" stroke="#0f172a" stroke-width="6"/>
			<path d="M 12,125 L 228,125 L 228,200 Q 228,232 194,232 L 46,232 Q 12,232 12,200 Z" fill="#e2e8f0"/>
			<rect x="30" y="44" width="180" height="68" rx="14" fill="#172b3a"/>
			<rect x="70" y="28" width="100" height="9" rx="4.5" fill="#e86a3a"/>
			<circle cx="50" cy="165" r="14" fill="#fbbf24"/>
			<circle cx="190" cy="165" r="14" fill="#fbbf24"/>
			<rect x="85" y="160" width="70" height="12" rx="6" fill="#94a3b8"/>
		</svg>
	</div>`,
	iconSize: [40, 40],
	iconAnchor: [20, 20],
	popupAnchor: [0, -22],
});

let busMarker = null;
let ultimaPosicaoOnibus = null;
const liveDotEl = document.getElementById("live-dot");
const liveStatusTextEl = document.getElementById("live-status-text");

function formatarTempo(segundos) {
	if (segundos < 60) return `${segundos}s`;
	const min = Math.floor(segundos / 60);
	return `${min} min`;
}

function atualizarStatusUI(tipo, texto) {
	if (!liveDotEl || !liveStatusTextEl) return;
	liveDotEl.className = "live-dot";
	if (tipo === "online") {
		liveDotEl.classList.add("active");
	} else if (tipo === "espera") {
		liveDotEl.classList.add("waiting");
	}
	liveStatusTextEl.textContent = texto;
}

async function buscarPosicaoOnibus() {
	try {
		const controller = new AbortController();
		const timeoutId = setTimeout(() => controller.abort(), 6000);

		const response = await fetch(INTRA_DATA.apiAoVivoUrl, {
			headers: { Accept: "application/json" },
			signal: controller.signal,
		});
		clearTimeout(timeoutId);

		if (!response.ok) {
			throw new Error(`Erro HTTP: ${response.status}`);
		}

		const dados = await response.json();
		processarDadosOnibus(dados);
	} catch (erro) {
		console.warn("Consulta à API do ônibus em tempo real:", erro.message);
		lidarComErroRastreamento(erro);
	}
}

function processarDadosOnibus(dados) {
	if (!dados.visivel || !dados.onibus || dados.onibus.length === 0) {
		atualizarStatusUI("espera", dados.motivo || "Ônibus fora de operação no momento.");
		return;
	}

	const info = dados.onibus[0];
	const pos = [info.lat, info.lng];
	ultimaPosicaoOnibus = pos;

	const popupHtml = `
		<div style="font-family: var(--font-body); min-width: 170px;">
			<strong style="font-size: 1rem; color: #1e3a8a;">Ônibus Intracampus</strong>
			<hr style="margin: 6px 0; border: none; border-top: 1px solid #e2e8f0;" />
			<div style="font-size: 0.85rem; line-height: 1.4; color: #334155;">
				<p style="margin: 2px 0;"><strong>Local:</strong> ${info.onde || "Em trânsito"}</p>
				${info.velocidade_kmh !== undefined ? `<p style="margin: 2px 0;"><strong>Velocidade:</strong> ${Math.round(info.velocidade_kmh)} km/h</p>` : ""}
				${info.bateria !== undefined ? `<p style="margin: 2px 0;"><strong>Bateria GPS:</strong> ${info.bateria}%</p>` : ""}
				<p style="margin: 4px 0 0; color: #64748b; font-size: 0.78rem;">Atualizado há ${formatarTempo(info.ha_segundos)}</p>
			</div>
		</div>
	`;

	if (!busMarker) {
		busMarker = L.marker(pos, { icon: busIcon, zIndexOffset: 1000 })
			.addTo(map)
			.bindPopup(popupHtml, { autoPanPadding: [20, 85], maxWidth: 280 });
	} else {
		busMarker.setLatLng(pos);
		busMarker.setPopupContent(popupHtml);
	}

	if (info.atrasada) {
		atualizarStatusUI("espera", `Última posição há ${formatarTempo(info.ha_segundos)} (${info.onde || "Em parada"})`);
	} else {
		atualizarStatusUI("online", `Ônibus em tempo real — ${info.onde || "Em movimento"}`);
	}
}

function lidarComErroRastreamento(erro) {
	const ehErroRedeOuCors = erro.name === "TypeError" || erro.name === "AbortError";

	if (ehErroRedeOuCors) {
		atualizarStatusUI(
			"espera",
			"Aguardando servidor de dados verifique sua conexão"
		);

		if (!busMarker) {
			const paradaInicial = INTRA_DATA.paradas[0];
			ultimaPosicaoOnibus = [paradaInicial.lat, paradaInicial.lng];
			busMarker = L.marker(ultimaPosicaoOnibus, { icon: busIcon, zIndexOffset: 1000 })
				.addTo(map)
				.bindPopup(`
					<div style="font-family: var(--font-body);">
						<strong>Ônibus Intracampus</strong>
						<p style="margin: 4px 0 0; color: #64748b; font-size: 0.85rem;">
							Ponto de partida: ${paradaInicial.nome}<br>
							(Ative o backend para sinal de GPS ao vivo)
						</p>
					</div>
				`);
		}
	} else {
		atualizarStatusUI("espera", "Sinal do ônibus temporariamente indisponível.");
	}
}

// ==========================================================================
// 6. Botões Flutuantes de Ação Rápida (FABs) & Localização
// ==========================================================================
const btnTrackBus = document.getElementById("btn-track-bus");
const btnMyLocation = document.getElementById("btn-my-location");
const btnRefreshLive = document.getElementById("btn-refresh-live");

// Centralizar no ônibus
if (btnTrackBus) {
	btnTrackBus.addEventListener("click", () => {
		if (ultimaPosicaoOnibus) {
			map.flyTo(ultimaPosicaoOnibus, 16, { duration: 1.2 });
			if (busMarker) busMarker.openPopup();
		} else {
			alert("A posição do ônibus ainda não foi localizada.");
		}
	});
}

// Marcador da localização do usuário
let userLocationMarker = null;

function definirLocalizacaoUsuario(lat, lng, rotulo = "Você está aqui") {
	const userPos = [lat, lng];
	const userIcon = L.divIcon({
		className: "user-location-marker-wrapper",
		html: `<div class="user-location-marker" title="${rotulo}"></div>`,
		iconSize: [18, 18],
		iconAnchor: [9, 9],
	});

	if (!userLocationMarker) {
		userLocationMarker = L.marker(userPos, {
			icon: userIcon,
			zIndexOffset: 900,
			draggable: true,
		})
			.addTo(map)
			.bindPopup(`<strong>${rotulo}</strong><br><small style="color:#64748b">Arraste para ajustar se desejar</small>`);
	} else {
		userLocationMarker.setLatLng(userPos);
		userLocationMarker.setPopupContent(`<strong>${rotulo}</strong><br><small style="color:#64748b">Arraste para ajustar se desejar</small>`);
	}

	map.flyTo(userPos, 16, { duration: 1.2 });
	userLocationMarker.openPopup();
}

// Minha Localização (com suporte seguro a iOS / HTTP e fallback interativo)
if (btnMyLocation) {
	btnMyLocation.addEventListener("click", () => {
		const isLocalhost =
			window.location.hostname === "localhost" ||
			window.location.hostname === "127.0.0.1";
		const isSecure = window.isSecureContext || isLocalhost;

		// Se o navegador bloquear o GPS por falta de HTTPS (comportamento padrão do iOS Safari em IP local HTTP)
		if (!isSecure && !isLocalhost) {
			alert(
				"Por diretrizes de segurança da Apple e do W3C, o GPS no celular exige conexão HTTPS.\n\n" +
				"Como estamos em teste na rede local (http://192.168...), o Safari bloqueia o GPS automático.\n\n" +
				"💡 Toque em qualquer lugar no mapa ou selecione uma parada abaixo para posicionar seu ponto de referência!"
			);

			// Ativa modo de toque no mapa para posicionar marcador
			map.once("click", (e) => {
				definirLocalizacaoUsuario(e.latlng.lat, e.latlng.lng, "Ponto definido por você");
			});
			return;
		}

		if (!navigator.geolocation) {
			alert("Seu navegador não suporta geolocalização.");
			return;
		}

		btnMyLocation.classList.add("spinning");

		navigator.geolocation.getCurrentPosition(
			(pos) => {
				btnMyLocation.classList.remove("spinning");
				definirLocalizacaoUsuario(pos.coords.latitude, pos.coords.longitude, "Sua localização atual (GPS)");
			},
			(erro) => {
				btnMyLocation.classList.remove("spinning");
				let msg = "Não foi possível obter a sua localização.";
				if (erro.code === erro.PERMISSION_DENIED) {
					msg = "Permissão de localização negada ou bloqueada pelo navegador (no iOS, conexões HTTP locais bloqueiam o GPS).\n\nVocê pode tocar no mapa para marcar seu ponto manualmente.";
				}
				alert(msg);
				map.once("click", (e) => {
					definirLocalizacaoUsuario(e.latlng.lat, e.latlng.lng, "Ponto definido por você");
				});
			},
			{ enableHighAccuracy: true, timeout: 8000 }
		);
	});
}

// Atualizar Sinal Imediatamente com animação de rotação SVG
if (btnRefreshLive) {
	btnRefreshLive.addEventListener("click", () => {
		btnRefreshLive.classList.add("spinning");
		buscarPosicaoOnibus().finally(() => {
			setTimeout(() => {
				btnRefreshLive.classList.remove("spinning");
			}, 600);
		});
	});
}

// Iniciar polling a cada 10 segundos
buscarPosicaoOnibus();
setInterval(buscarPosicaoOnibus, INTRA_DATA.intervaloAtualizacaoMs);
