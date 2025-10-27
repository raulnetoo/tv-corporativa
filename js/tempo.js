// ATENÇÃO: Substitua pela sua chave API da OpenWeatherMap
const OPENWEATHER_API_KEY = '663757f8b7d193f0b4d8c80a07e0202e'; 
// Substitua pelas coordenadas da sua cidade (Ex: São José do Rio Preto)
const LAT = '-20.8222'; 
const LON = '-49.3875'; 
const UNIDADES = 'metric'; // Unidades métricas (Celsius)
const LANG = 'pt_br';

async function fetchWeatherData(endpoint) {
    const url = `https://api.openweathermap.org/data/2.5/${endpoint}?lat=${LAT}&lon=${LON}&units=${UNIDADES}&lang=${LANG}&appid=${OPENWEATHER_API_KEY}`;
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Erro API OpenWeather: ${response.status}`);
    }
    return response.json();
}

/** * Mapeia os códigos de ícone do OpenWeather para classes Font Awesome E CORES.
 * Retorna um objeto { iconClass: string, color: string }
 */
function getWeatherIcon(iconCode) {
    switch (iconCode) {
        // Céu Limpo
        case '01d': return { iconClass: 'fas fa-sun', color: '#FFD700' }; // Amarelo Dourado (Sol)
        case '01n': return { iconClass: 'fas fa-moon', color: '#ADD8E6' }; // Azul Claro (Lua)

        // Poucas Nuvens
        case '02d': 
        case '02n': return { iconClass: 'fas fa-cloud-sun', color: '#ADD8E6' }; // Azul Claro

        // Nuvens dispersas / Nuvens
        case '03d':
        case '03n': return { iconClass: 'fas fa-cloud', color: '#B0C4DE' }; // Azul Acinzentado

        // Nublado
        case '04d':
        case '04n': return { iconClass: 'fas fa-cloud', color: '#808080' }; // Cinza

        // Chuva fraca / Chuva
        case '09d':
        case '09n': return { iconClass: 'fas fa-cloud-showers-heavy', color: '#4682B4' }; // Azul Aço
        case '10d':
        case '10n': return { iconClass: 'fas fa-cloud-rain', color: '#4169E1' }; // Azul Royal

        // Trovoadas
        case '11d':
        case '11n': return { iconClass: 'fas fa-bolt', color: '#FFC300' }; // Laranja/Amarelo (Raio)

        // Neve
        case '13d':
        case '13n': return { iconClass: 'fas fa-snowflake', color: '#E0FFFF' }; // Azul Claro Gelado

        // Névoa
        case '50d':
        case '50n': return { iconClass: 'fas fa-smog', color: '#C0C0C0' }; // Prata

        default: return { iconClass: 'fas fa-question-circle', color: 'var(--cor-destaque)' };
    }
}

async function loadTempo() {
    try {
        // Busca Condição Atual
        const currentData = await fetchWeatherData('weather');

        // Obtém o ícone e a cor para o clima atual
        const currentCondition = getWeatherIcon(currentData.weather[0].icon);

        document.getElementById('tempo-temp').innerHTML = `${Math.round(currentData.main.temp)}°C`;
        
        // APLICAÇÃO DA COR NO ÍCONE DO CLIMA ATUAL
        document.getElementById('tempo-descricao').innerHTML = `
            <i class="${currentCondition.iconClass}" style="color: ${currentCondition.color};"></i>
            <small>${currentData.weather[0].description.toUpperCase()}</small>
        `;

        // Busca Previsão de 5 Dias (a cada 3h, pegaremos o do dia)
        const forecastData = await fetchWeatherData('forecast');
        const previsaoLista = document.getElementById('tempo-previsao-lista');
        previsaoLista.innerHTML = ''; // Limpa a lista anterior

        // Filtra para pegar apenas uma previsão por dia (ex: meio-dia)
        const previsoesDoDia = {};
        for (const item of forecastData.list) {
            const date = new Date(item.dt * 1000);
            const diaSemana = date.toLocaleDateString('pt-BR', { weekday: 'short' });
            
            // Pega a previsão mais próxima do meio-dia (ex: 12h, 15h) para representar o dia
            if (!previsoesDoDia[diaSemana] && date.getHours() >= 12 && date.getHours() <= 15) {
                previsoesDoDia[diaSemana] = item;
            }
        }
        
        // Exibe as previsões (limita a 4 dias futuros)
        Object.keys(previsoesDoDia).slice(0, 4).forEach(dia => {
            const item = previsoesDoDia[dia];
            
            // Obtém o ícone e a cor para a previsão
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

    } catch (error) {
        console.error("Erro ao carregar Tempo:", error);
        document.getElementById('tempo-temp').innerHTML = 'N/A';
        document.getElementById('tempo-descricao').innerHTML = 'Erro de API';
    }
}