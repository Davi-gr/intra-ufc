/**
 * Lógica principal da aplicação INTRA UFC.
 * Renderiza o mapa interativo, rotas, paradas e o rastreamento em tempo real do ônibus.
 */

// 1. Inicialização do Mapa
const map = L.map("map").setView(
	[INTRA_DATA.centro.lat, INTRA_DATA.centro.lng],
	INTRA_DATA.centro.zoom
);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
	maxZoom: 19,
	attribution: "&copy; OpenStreetMap contributors",
}).addTo(map);

// 2. Traçado das Rotas de Ida e Volta
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

// 3. Renderização das Paradas e Painel Lateral
const marcadoresParadas = {};
const stopsListEl = document.getElementById("stops-list");

INTRA_DATA.paradas.forEach((parada, index) => {
	// Ícone personalizado para a parada
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
				<strong style="color: var(--color-ink); font-size: 1rem;">${parada.nome}</strong>
				<p style="margin: 4px 0 0; color: var(--color-muted); font-size: 0.85rem;">Parada #${index + 1} do Intracampus UFC</p>
			</div>
		`);

	marcadoresParadas[parada.id] = marker;

	// Inserir item clicável no painel lateral
	if (stopsListEl) {
		const li = document.createElement("li");
		const button = document.createElement("button");
		button.type = "button";
		button.innerHTML = `<span><span class="stop-dot"></span>${parada.nome}</span><small style="color:#94a3b8">#${index + 1}</small>`;
		button.addEventListener("click", () => {
			map.flyTo([parada.lat, parada.lng], 16, { duration: 1.2 });
			marker.openPopup();
		});
		li.appendChild(button);
		stopsListEl.appendChild(li);
	}
});

// 4. Rastreamento do Ônibus em Tempo Real
const busIcon = L.divIcon({
	className: "custom-bus-marker-wrapper",
	html: `<div class="custom-bus-marker" title="Ônibus Intracampus">🚌</div>`,
	iconSize: [38, 38],
	iconAnchor: [19, 19],
	popupAnchor: [0, -20],
});

let busMarker = null;
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

	const popupHtml = `
		<div style="font-family: var(--font-body); min-width: 170px;">
			<strong style="font-size: 1rem; color: #1e3a8a;">🚌 Ônibus Intracampus</strong>
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
			.bindPopup(popupHtml);
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
	// Se for erro de CORS ao abrir direto via file:// ou sem backend proxy
	const ehErroRedeOuCors = erro.name === "TypeError" || erro.name === "AbortError";
	
	if (ehErroRedeOuCors) {
		atualizarStatusUI(
			"espera",
			"Aguardando servidor de dados (conecte via proxy se executar localmente)"
		);
		
		// Posiciona o marcador na primeira parada como demonstração se ainda não houver marcador
		if (!busMarker) {
			const paradaInicial = INTRA_DATA.paradas[0];
			busMarker = L.marker([paradaInicial.lat, paradaInicial.lng], { icon: busIcon, zIndexOffset: 1000 })
				.addTo(map)
				.bindPopup(`
					<div style="font-family: var(--font-body);">
						<strong>🚌 Ônibus Intracampus</strong>
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

// Iniciar polling a cada 10 segundos
buscarPosicaoOnibus();
setInterval(buscarPosicaoOnibus, INTRA_DATA.intervaloAtualizacaoMs);
