// js/horarios.js

/**
 * Formata um objeto Date para a hora e data em um fuso horário específico.
 * @param {Date} date - O objeto Date atual.
 * @param {string} fuso - A string do fuso horário (ex: 'America/Sao_Paulo').
 * @returns {string} O HTML formatado com hora e data.
 */
function formatarHora(date, fuso) {
    // Opções de formatação para a HORA (24h, com segundos)
    const options = {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit', 
        hour12: false, // Usando formato 24h para clareza e padrão corporativo
        timeZone: fuso
    };
    // Formatamos a hora para a região do usuário, mas aplicando o timezone
    const time = new Intl.DateTimeFormat('pt-BR', options).format(date);
    
    // Opções de formatação para a DATA
    const optionsData = {
        day: '2-digit',
        month: '2-digit',
        timeZone: fuso
    };
    const data = new Intl.DateTimeFormat('pt-BR', optionsData).format(date);
    
    // Retorna o HTML: hora principal com classe para estilização e data em <small>
    return `<span class="hora-valor">${time}</span> <small>(${data})</small>`;
}

/**
 * Carrega e atualiza todos os horários na seção 'hora_mundial'.
 */
function loadHorarios() {
    const agora = new Date(); // Cria um objeto Date único para o momento atual

    // Definição dos fusos horários chave
    const fuso_br = 'America/Sao_Paulo';
    const fuso_ny = 'America/New_York';
    const fuso_hk = 'Asia/Hong_Kong';

    // Formatação dos horários
    const horaBrasil = formatarHora(agora, fuso_br);
    const horaNY = formatarHora(agora, fuso_ny);
    const horaHK = formatarHora(agora, fuso_hk);

    // Inserção no DOM: o nome da cidade é seguido por <br> para separar o nome da hora
    document.getElementById('hora-brasil').innerHTML = `Brasil<br>${horaBrasil}`;
    document.getElementById('hora-ny').innerHTML = `New York<br>${horaNY}`;
    document.getElementById('hora-hk').innerHTML = `Hong Kong<br>${horaHK}`;
}

// Nota: A chamada inicial (loadHorarios()) e a atualização contínua (setInterval(loadHorarios, 1000)) 
// já estão configuradas no seu index.html.