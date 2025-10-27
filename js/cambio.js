// Depende de API Externa: AwesomeAPI (gratuita para uso básico)
const MOEDAS = [
    { code: 'USD-BRL', nome: 'Dólar', icone: 'fas fa-dollar-sign' },
    { code: 'EUR-BRL', nome: 'Euro', icone: 'fas fa-euro-sign' },
    { code: 'GBP-BRL', nome: 'Libra', icone: 'fas fa-sterling-sign' },
    { code: 'BTC-BRL', nome: 'Bitcoin', icone: 'fab fa-btc', isCripto: true },
    { code: 'ETH-BRL', nome: 'Ethereum', icone: 'fab fa-ethereum', isCripto: true }
];

let cotacaoData = {};
let moedaIndex = 0;
const CAMBIO_DURATION = 5000; // 5 segundos

// 1. Busca todos os dados de uma vez
async function fetchCambioData() {
    // Cria a string de moedas para a API (ex: USD-BRL,EUR-BRL,...)
    const moedasStr = MOEDAS.map(m => m.code).join(',');
    const API_CAMBIO_URL = `https://economia.awesomeapi.com.br/json/last/${moedasStr}`;
    
    try {
        const response = await fetch(API_CAMBIO_URL);
        cotacaoData = await response.json();
        
        // Inicia o loop após carregar
        startCambioLoop();
    } catch (error) {
        console.error("Erro ao buscar dados de Câmbio:", error);
        document.getElementById('cambio-valor').innerHTML = 'R$ X,XX <small>Erro API</small>';
    }
}

// 2. Exibe o próximo item no loop
function displayProximoCambio() {
    if (Object.keys(cotacaoData).length === 0) return;

    const moedaConfig = MOEDAS[moedaIndex];
    const data = cotacaoData[moedaConfig.code.replace('-', '')];
    
    if (!data) {
        moedaIndex = (moedaIndex + 1) % MOEDAS.length;
        return; // Pula se a moeda não foi encontrada
    }

    const valor = parseFloat(data.bid).toFixed(2).replace('.', ',');
    const variacao = parseFloat(data.pctChange);
    const tipoValor = moedaConfig.isCripto ? '' : 'R$';
    
    // Define cor e ícone de variação
    let corVariacao = variacao >= 0 ? '#4CAF50' : '#F44336';
    let icone = variacao >= 0 ? '<i class="fas fa-arrow-up"></i>' : '<i class="fas fa-arrow-down"></i>';
    let labelVariacao = variacao >= 0 ? 'subindo' : 'descendo';
    
    // Atualiza o DOM
    document.getElementById('secao-cambio').innerHTML = `
        <h3><i class="${moedaConfig.icone}"></i> ${moedaConfig.nome} Hoje:</h3>
        <div id="cambio-valor" style="color: ${tipoValor ? '#FF9800' : '#4CAF50'};">
            ${tipoValor} ${valor} 
        </div>
        <p style="font-size: 1.2rem; color: ${corVariacao}; margin-top: 0.5rem;">
            ${icone} ${labelVariacao} ${Math.abs(variacao).toFixed(2)}%
        </p>
    `;

    moedaIndex = (moedaIndex + 1) % MOEDAS.length;
}

function startCambioLoop() {
    displayProximoCambio();
    setInterval(displayProximoCambio, CAMBIO_DURATION);
}

// No index.html, você deve chamar 'fetchCambioData()'