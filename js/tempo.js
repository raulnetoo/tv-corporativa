// ATENÇÃO: Substitua pela sua chave API da OpenWeatherMap
const OPENWEATHER_API_KEY = 'SUA_CHAVE_API_OPENWEATHERMAP'; 
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

/** * Mapeia os códigos de ícone do OpenWeather para classes Font Awesome.
 * É uma simplificação, você pode expandir para mais detalhes.
 */
function getWeatherIcon(iconCode) {
    switch (iconCode) {
        case '01d': return 'fas fa-sun'; // Céu limpo (dia)
        case '01n': return 'fas fa-moon'; // Céu limpo (noite)
        case '02d': 
        case '02n': return 'fas fa-cloud-sun'; // Poucas nuvens
        case '03d':
        case '03n': return 'fas fa-cloud'; // Nuvens dispersas
        case '04d':
        case '04n': return 'fas fa-cloud-meatball'; // Nublado
        case '09d':
        case '09n': return 'fas fa-cloud-showers-heavy'; // Chuva fraca
        case '10d':
        case '10n': return 'fas fa-cloud-rain'; // Chuva
        case '11d':
        case '11n': return 'fas fa-bolt'; // Trovoadas
        case '13d':
        case '13n': return 'fas fa-snowflake'; // Neve
        case '50d':
        case '50n': return 'fas fa-smog'; // Névoa
        default: return 'fas fa-question-circle';
    }
}

async function loadTempo() {
    try {
        // Busca Condição Atual
        const currentData = await fetchWeatherData('weather');

        document.getElementById('tempo-temp').innerHTML = `${Math.round(currentData.main.temp)}°C`;
        document.getElementById('tempo-descricao').innerHTML = `
            <i class="${getWeatherIcon(currentData.weather[0].icon)}"></i>
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
            const div = document.createElement('div');
            div.className = 'previsao-dia';
            div.innerHTML = `
                <div>${dia.toUpperCase().replace('.', '')}</div>
                <i class="${getWeatherIcon(item.weather[0].icon)}"></i>
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