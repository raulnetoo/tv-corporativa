// ATENÇÃO: Substitua pela sua chave API da OpenWeatherMap
const OPENWEATHER_API_KEY = '663757f8b7d193f0b4d8c80a07e0202e'; 
// Substitua pelas coordenadas da sua cidade (Ex: São José do Rio Preto)
const LAT = '-20.8222'; 
const LON = '-49.3875'; 
const UNIDADES = 'metric'; // Unidades métricas (Celsius)
const LANG = 'pt_br';

/**
 * Função de busca compatível com navegadores antigos (XMLHttpRequest com Promise)
 * @param {string} endpoint - 'weather' ou 'forecast'
 * @returns {Promise<Object>} Dados JSON da API
 */
function fetchWeatherData(endpoint) {
    return new Promise((resolve, reject) => {
        const url = `https://api.openweathermap.org/data/2.5/${endpoint}?lat=${LAT}&lon=${LON}&units=${UNIDADES}&lang=${LANG}&appid=${OPENWEATHER_API_KEY}`;
        
        // Usa XMLHttpRequest, que é suportado em navegadores antigos
        const xhr = new XMLHttpRequest();
        xhr.open('GET', url);
        
        xhr.onload = function() {
            if (xhr.status >= 200 && xhr.status < 300) {
                try {
                    // Tenta fazer o parse do JSON
                    resolve(JSON.parse(xhr.responseText));
                } catch (e) {
                    reject(new Error("Erro ao processar JSON da API OpenWeather."));
                }
            } else {
                reject(new Error(`Erro API OpenWeather: ${xhr.status}`));
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
    // Código inalterado - a lógica de mapeamento está correta
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

/**
 * Função principal reescrita para usar .then() (sem async/await)
 */
function loadTempo() {
    // Busca Condição Atual
    fetchWeatherData('weather')
        .then(currentData => {
            // Se a primeira busca funcionar, atualiza o clima atual
            const currentCondition = getWeatherIcon(currentData.weather[0].icon);

            document.getElementById('tempo-temp').innerHTML = `${Math.round(currentData.main.temp)}°C`;
            
            // APLICAÇÃO DA COR NO ÍCONE DO CLIMA ATUAL
            document.getElementById('tempo-descricao').innerHTML = `
                <i class="${currentCondition.iconClass}" style="color: ${currentCondition.color};"></i>
                <small>${currentData.weather[0].description.toUpperCase()}</small>
            `;

            // Chama a busca da previsão de 5 dias
            return fetchWeatherData('forecast');
        })
        .then(forecastData => {
            // Se a segunda busca funcionar, processa a previsão
            const previsaoLista = document.getElementById('tempo-previsao-lista');
            previsaoLista.innerHTML = ''; // Limpa a lista anterior

            const previsoesDoDia = {};
            for (const item of forecastData.list) {
                // A Date API geralmente é bem suportada
                const date = new Date(item.dt * 1000);
                // .toLocaleDateString pode ser um problema, mas vamos manter por enquanto
                const diaSemana = date.toLocaleDateString('pt-BR', { weekday: 'short' });
                
                // Pega a previsão mais próxima do meio-dia
                if (!previsoesDoDia[diaSemana] && date.getHours() >= 12 && date.getHours() <= 15) {
                    previsoesDoDia[diaSemana] = item;
                }
            }
            
            // Exibe as previsões (limita a 4 dias futuros)
            Object.keys(previsoesDoDia).slice(0, 4).forEach(dia => {
                const item = previsoesDoDia[dia];
                const forecastCondition = getWeatherIcon(item.weather[0].icon);

                const div = document.createElement('div');
                div.className = 'previsao-dia';
                div.innerHTML = `
                    <div>${dia.toUpperCase().replace('.', '')}</div>
                    <i class="${forecastCondition.iconClass}" style="color: ${forecastCondition.color};"></i>
                    <div>${Math.round(item.main.temp_max)}° / ${Math.round(item.main.temp_min)}°</div>
                `;
                previsaoLista.appendChild(div);
            });
        })
        .catch(error => {
            // Bloco de tratamento de erros
            console.error("Erro ao carregar Tempo (WebOS compatível):", error);
            document.getElementById('tempo-temp').innerHTML = 'N/A';
            document.getElementById('tempo-descricao').innerHTML = 'Erro de API';
        });
}