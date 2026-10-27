/**
 * Dados de rotas e paradas do transporte intracampus da UFC Sobral.
 * Extraídos do portal oficial da Prefeitura do Campus.
 */
const INTRA_DATA = {
	centro: {
		lat: -3.6871849,
		lng: -40.3478909,
		zoom: 14,
	},
	apiAoVivoUrl:
		window.location.hostname === "localhost" ||
		window.location.hostname === "127.0.0.1" ||
		window.location.hostname.endsWith(".local") ||
		/^192\.168\./.test(window.location.hostname) ||
		/^10\./.test(window.location.hostname) ||
		/^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(window.location.hostname)
			? "/api/onibus/ao-vivo"
			: "https://sobral.179.197.66.83.sslip.io/onibus/ao-vivo",
	intervaloAtualizacaoMs: 10000,
	avisos: [
		// Deixe a lista vazia [] ou adicione avisos da prefeitura do campus:
		// {
		// 	id: "aviso-1",
		// 	data: "Hoje, 17:00",
		// 	titulo: "Operação Normal",
		// 	mensagem: "Transporte operando normalmente com saídas regulares do Mucambinho.",
		// 	tipo: "info", // "info", "alerta", "urgente"
		// },
	],
	paradas: [
		{ id: "mucambinho", nome: "Campus Mucambinho", lat: -3.6924258, lng: -40.3551757 },
		{ id: "santacasa", nome: "Santa Casa", lat: -3.6926081, lng: -40.3585607 },
		{ id: "spa", nome: "SPA", lat: -3.688823, lng: -40.3534538 },
		{ id: "cadeia", nome: "Cadeia Criativa (Mercado)", lat: -3.6850254, lng: -40.3522038 },
		{ id: "pedrinhas", nome: "Pedrinhas (Academia B2)", lat: -3.6854183, lng: -40.3411746 },
		{ id: "famed", nome: "FAMED", lat: -3.6820564, lng: -40.3373981 },
	],
	rotas: {
		ida: {
			nome: "Ida (Mucambinho → FAMED)",
			cor: "#0d6efd",
			peso: 4,
			opacidade: 0.85,
			coordenadas: [
				[-3.6923241, -40.3551435],
				[-3.6924459, -40.3560448],
				[-3.6929022, -40.355975],
				[-3.6930561, -40.3569889],
				[-3.6926935, -40.358271],
				[-3.6924405, -40.3595799],
				[-3.6921782, -40.359478],
				[-3.6919641, -40.3575951],
				[-3.6917981, -40.3559321],
				[-3.6913578, -40.3524399],
				[-3.6902443, -40.3526115],
				[-3.6896019, -40.3527725],
				[-3.6883774, -40.3531426],
				[-3.6877296, -40.3522146],
				[-3.6868523, -40.3530836],
				[-3.6863866, -40.3535584],
				[-3.6851547, -40.3522307],
				[-3.6840786, -40.3510934],
				[-3.6825141, -40.3494358],
				[-3.6822572, -40.3491461],
				[-3.6817299, -40.348599],
				[-3.6814515, -40.3482932],
				[-3.6819868, -40.3478587],
				[-3.6823776, -40.3463781],
				[-3.6830936, -40.344345],
				[-3.6834577, -40.3432453],
				[-3.6834416, -40.3430843],
				[-3.6838859, -40.3425962],
				[-3.6854063, -40.3411692],
				[-3.6864435, -40.3400373],
				[-3.6870002, -40.3382885],
				[-3.6845484, -40.3369582],
				[-3.6825248, -40.3362072],
				[-3.6820752, -40.3373659],
			],
		},
		volta: {
			nome: "Volta (FAMED → Mucambinho)",
			cor: "#e8590c",
			peso: 4,
			opacidade: 0.85,
			coordenadas: [
				[-3.6820564, -40.3374195],
				[-3.6820859, -40.3374088],
				[-3.6812909, -40.3397852],
				[-3.6848696, -40.3436208],
				[-3.6843557, -40.3442323],
				[-3.6836383, -40.3454876],
				[-3.6829879, -40.3469038],
				[-3.6823642, -40.3482449],
				[-3.6873455, -40.3535557],
				[-3.6899044, -40.3531694],
				[-3.6920537, -40.3528905],
				[-3.6922893, -40.3550684],
			],
		},
	},
};
