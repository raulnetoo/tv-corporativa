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

// 1. Busca todos os dados de uma vez - REESCRITO PARA XHR/PROMISE
function fetchCambioData() {
    // Cria a string de moedas para a API (ex: USD-BRL,EUR-BRL,...)
    const moedasStr = MOEDAS.map(m => m.code).join(',');
    const API_CAMBIO_URL = `https://economia.awesomeapi.com.br/json/last/${moedasStr}`;
    
    // Retorna uma Promise
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('GET', API_CAMBIO_URL);
        
        xhr.onload = function() {
            if (xhr.status >= 200 && xhr.status < 300) {
                try {
                    cotacaoData = JSON.parse(xhr.responseText);
                    resolve(cotacaoData);
                } catch (e) {
                    console.error("Erro ao processar JSON de Câmbio:", e);
                    reject(e);
                }
            } else {
                console.error(`Erro HTTP ao buscar Câmbio: ${xhr.status}`);
                reject(new Error(`Erro HTTP ${xhr.status}`));
            }
        };

        xhr.onerror = function() {
            console.error("Erro de rede ao buscar Câmbio.");
            reject(new Error("Erro de rede."));
        };

        xhr.send();
    })
    .then(data => {
        // Inicia o loop após carregar com sucesso
        startCambioLoop();
        return data; // Opcional, apenas para manter o fluxo de Promise
    })
    .catch(error => {
        // Trata erros de requisição ou parse
        document.getElementById('cambio-valor').innerHTML = 'R$ X,XX <small>Erro API</small>';
        // Mantém o estado de erro, mas não quebra a aplicação
    });
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

    // 1. Atualiza o TÍTULO DA SEÇÃO (para mostrar a moeda atual)
    document.querySelector('#secao-cambio h3').innerHTML = `<i class="${moedaConfig.icone}"></i> ${moedaConfig.nome} Hoje:`;

    // 2. Atualiza APENAS O VALOR (mantendo o container #cambio-valor no lugar)
    const cambioValorDiv = document.getElementById('cambio-valor');
    cambioValorDiv.innerHTML = `${tipoValor} ${valor}`;
    
    // 3. Adiciona a variação (Primeiro, vamos garantir que um container exista para a variação)
    
    // CRIAÇÃO DE UM CONTAINER DE VARIAÇÃO (se não existir, cria)
    let variacaoParagrafo = document.getElementById('cambio-variacao-paragrafo');
    if (!variacaoParagrafo) {
        variacaoParagrafo = document.createElement('p');
        variacaoParagrafo.id = 'cambio-variacao-paragrafo';
        // Insere APÓS a div do valor
        cambioValorDiv.parentNode.insertBefore(variacaoParagrafo, cambioValorDiv.nextSibling);
    }
    
    // Atualiza o parágrafo de variação
    variacaoParagrafo.style.fontSize = '1.2rem';
    variacaoParagrafo.style.color = corVariacao;
    variacaoParagrafo.style.marginTop = '0.5rem';
    variacaoParagrafo.innerHTML = `${icone} ${Math.abs(variacao).toFixed(2)}% (${labelVariacao})`;


    moedaIndex = (moedaIndex + 1) % MOEDAS.length;
}

function startCambioLoop() {
    displayProximoCambio();
    // Limpa o intervalo antigo (caso a função seja chamada novamente)
    if (this.cambioInterval) {
        clearInterval(this.cambioInterval);
    }
    this.cambioInterval = setInterval(displayProximoCambio, CAMBIO_DURATION);
}

// No index.html, você deve chamar 'fetchCambioData()'