// ATENÇÃO: Substitua pela sua chave API da OpenWeatherMap
const OPENWEATHER_API_KEY = '663757f8b7d193f0b4d8c80a07e0202e'; 
// Substitua pelas coordenadas da sua cidade (Ex: São José do Rio Preto)
const LAT = '-20.8222'; 
const LON = '-49.3875'; 
const UNIDADES = 'metric'; // Unidades métricas (Celsius)
const LANG = 'pt_br';

// Variáveis Globais e Utilitárias
const DIAS_SEMANA_CURTOS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const MESES_CURTOS = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
let clockInterval; // Variável para o loop do relógio


/* ----------------------------------- */
/* FUNÇÕES DE BUSCA (XHR/Promise) */
/* ----------------------------------- */

/**
 * Função de busca compatível com navegadores antigos (XMLHttpRequest com Promise)
 * @param {string} endpoint - 'weather' ou 'forecast'
 * @returns {Promise<Object>} Dados JSON da API
 */
function fetchWeatherData(endpoint) {
    return new Promise((resolve, reject) => {
        // CORRIGIDO: O endpoint 'forecast' do OpenWeather é de 5 dias/3 horas (e não forecast/daily)
        const url = `https://api.openweathermap.org/data/2.5/${endpoint}?lat=${LAT}&lon=${LON}&units=${UNIDADES}&lang=${LANG}&appid=${OPENWEATHER_API_KEY}`;
        
        const xhr = new XMLHttpRequest();
        xhr.open('GET', url);
        
        xhr.onload = function() {
            if (xhr.status >= 200 && xhr.status < 300) {
                try {
                    resolve(JSON.parse(xhr.responseText));
                } catch (e) {
                    reject(new Error("Erro ao processar JSON da API OpenWeather."));
                }
            } else {
                reject(new Error(`Erro API OpenWeather: ${xhr.status} - Verifique LAT/LON/KEY`));
            }
        };

        xhr.onerror = function() {
            reject(new Error("Erro de rede ao conectar com OpenWeather."));
        };

        xhr.send();
    });
}

/** * Mapeia os códigos de ícone do OpenWeather para classes Font Awesome E CORES.
 * Retorna um objeto { iconClass: string, color: string }
 */
function getWeatherIcon(iconCode) {
    // Código inalterado, pois a lógica de mapeamento está correta.
    switch (iconCode) {
        // Céu Limpo
        case '01d': return { iconClass: 'fas fa-sun', color: '#FFD700' }; 
        case '01n': return { iconClass: 'fas fa-moon', color: '#ADD8E6' }; 
        // Poucas Nuvens
        case '02d': 
        case '02n': return { iconClass: 'fas fa-cloud-sun', color: '#ADD8E6' }; 
        // Nuvens dispersas / Nuvens
        case '03d':
        case '03n': return { iconClass: 'fas fa-cloud', color: '#B0C4DE' }; 
        // Nublado
        case '04d':
        case '04n': return { iconClass: 'fas fa-cloud', color: '#808080' }; 
        // Chuva fraca / Chuva
        case '09d':
        case '09n': return { iconClass: 'fas fa-cloud-showers-heavy', color: '#4682B4' }; 
        case '10d':
        case '10n': return { iconClass: 'fas fa-cloud-rain', color: '#4169E1' }; 
        // Trovoadas
        case '11d':
        case '11n': return { iconClass: 'fas fa-bolt', color: '#FFC300' }; 
        // Neve
        case '13d':
        case '13n': return { iconClass: 'fas fa-snowflake', color: '#E0FFFF' }; 
        // Névoa
        case '50d':
        case '50n': return { iconClass: 'fas fa-smog', color: '#C0C0C0' }; 
        default: return { iconClass: 'fas fa-question-circle', color: 'var(--cor-destaque)' };
    }
}


/* ----------------------------------- */
/* LÓGICA DE PREVISÃO E RENDERIZAÇÃO */
/* ----------------------------------- */

/**
 * Função principal reescrita para usar .then() e lógica de filtragem de dias
 */
function loadTempo() {
    // Busca Condição Atual
    fetchWeatherData('weather')
        .then(currentData => {
            // Atualiza o clima atual (temperatura e ícone)
            const currentCondition = getWeatherIcon(currentData.weather[0].icon);
            const descricaoFormatada = currentData.weather[0].description.toUpperCase();
            
            document.getElementById('tempo-temp').innerHTML = `${Math.round(currentData.main.temp)}°C`;
            document.getElementById('tempo-local').textContent = currentData.name;
            
            // Aplica a cor no ícone do clima atual
            document.getElementById('tempo-descricao').innerHTML = `
                <i class="${currentCondition.iconClass}" style="color: ${currentCondition.color};"></i>
                <small>${descricaoFormatada}</small>
            `;

            // Chama a busca da previsão de 5 dias (por hora)
            return fetchWeatherData('forecast');
        })
        .then(forecastData => {
            const previsaoListaElement = document.getElementById('tempo-previsao-lista');
            previsaoListaElement.innerHTML = ''; // Limpa a lista anterior

            const hoje = new Date().getDay(); // Obtém o dia da semana atual (0=Dom, 1=Seg...)
            const previsoesPorDia = {};
            let diasContados = 0;

            for (const item of forecastData.list) {
                const date = new Date(item.dt * 1000);
                const diaDaPrevisao = date.getDay(); // Dia da semana do item
                
                // Mapeia o nome do dia usando o array local (mais seguro que toLocaleDateString)
                const nomeDia = DIAS_SEMANA_CURTOS[diaDaPrevisao];

                // Condições: 
                // 1. Deve ser o dia seguinte ou um dia futuro (diaDaPrevisao !== hoje)
                // 2. Deve ser a previsão próxima ao meio-dia (entre 12h e 15h)
                // 3. Se o dia já foi registrado, pula (garante que pega apenas UMA previsão por dia)
                if (diaDaPrevisao !== hoje && !previsoesPorDia[diaDaPrevisao] && date.getHours() >= 12 && date.getHours() <= 15) {
                    previsoesPorDia[diaDaPrevisao] = item;
                    diasContados++;
                }

                // Limita a 4 dias futuros
                if (diasContados >= 4) {
                    break;
                }
            }
            
            // Exibe as 4 previsões (garantidas a serem de dias futuros)
            Object.keys(previsoesPorDia).forEach(key => {
                const item = previsoesPorDia[key];
                const forecastCondition = getWeatherIcon(item.weather[0].icon);

                const div = document.createElement('div');
                div.className = 'previsao-dia';
                // Usamos o nome do dia do array local
                const nomeDia = DIAS_SEMANA_CURTOS[key]; 
                
                div.innerHTML = `
                    <div>${nomeDia.toUpperCase().replace('.', '')}</div>
                    <i class="${forecastCondition.iconClass}" style="color: ${forecastCondition.color};"></i>
                    <div>${Math.round(item.main.temp_max)}° / ${Math.round(item.main.temp_min)}°</div>
                `;
                previsaoListaElement.appendChild(div);
            });
        })
        .catch(error => {
            // Bloco de tratamento de erros
            console.error("Erro ao carregar Tempo (WebOS compatível):", error);
            document.getElementById('tempo-temp').innerHTML = 'N/A';
            document.getElementById('tempo-descricao').innerHTML = 'Erro de API';
        });
}


/* ----------------------------------- */
/* FUNÇÕES DE RELÓGIO (Hora Mundial) */
/* ----------------------------------- */

function updateHoraAtual() {
    // 1. Hora Local (Baseado no sistema da TV/Dispositivo)
    const agora = new Date();
    const hora = agora.getHours().toString().padStart(2, '0');
    const minuto = agora.getMinutes().toString().padStart(2, '0');
    const segundo = agora.getSeconds().toString().padStart(2, '0');
    
    // Mapeamento seguro de data
    const diaSemana = DIAS_SEMANA_CURTOS[agora.getDay()];
    const diaMes = agora.getDate();
    const mes = MESES_CURTOS[agora.getMonth()];

    // Atualiza a hora principal (assumindo que esta é a seção #hora-local)
    const horaLocalDiv = document.getElementById('hora-local');
    if (horaLocalDiv) {
        // NOTA: Ajuste o ID se #hora-local não for o container que você quer.
        horaLocalDiv.innerHTML = `
            <div class="hora-valor">${hora}:${minuto}<small>:${segundo}</small></div>
            <small>${diaSemana}, ${diaMes} ${mes}</small>
        `;
    }

    // Seções adicionais de Horário Mundial (Se existirem, elas vão aqui)
    // Ex: document.getElementById('hora-tokyo').innerHTML = ...;
}

/**
 * Inicializa o loop do relógio.
 */
function startClockLoop() {
    updateHoraAtual();
    if (clockInterval) {
        clearInterval(clockInterval);
    }
    clockInterval = setInterval(updateHoraAtual, 1000); 
}

/* ----------------------------------- */
/* CHAMADAS INICIAIS (SUGESTÃO) */
/* ----------------------------------- */

/*
// Se você está chamando loadTempo() e startClockLoop() diretamente no index.html,
// você não precisa deste bloco. Caso contrário, adicione-o.
window.addEventListener('load', function() {
    startClockLoop();
    // A primeira carga da API de Tempo é feita aqui.
    loadTempo();
    // Você pode recarregar o tempo a cada 30 minutos, por exemplo:
    setInterval(loadTempo, 1800000); // 30 minutos
});
*/