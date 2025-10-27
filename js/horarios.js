function formatarHora(date, fuso) {
    const options = {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit', // Adicionado Segundos
        hour12: true, 
        timeZone: fuso
    };
    const time = new Intl.DateTimeFormat('pt-BR', options).format(date);
    
    const optionsData = {
        day: '2-digit',
        month: '2-digit',
        timeZone: fuso
    };
    const data = new Intl.DateTimeFormat('pt-BR', optionsData).format(date);
    
    return `${time} <small>(${data})</small>`;
}

function loadHorarios() {
    const agora = new Date();

    const fuso_br = 'America/Sao_Paulo';
    const fuso_ny = 'America/New_York';
    const fuso_hk = 'Asia/Hong_Kong';

    const horaBrasil = formatarHora(agora, fuso_br);
    const horaNY = formatarHora(agora, fuso_ny);
    const horaHK = formatarHora(agora, fuso_hk);

    // Ajuste no DOM para um visual melhor
    document.getElementById('hora-brasil').innerHTML = `**Brasília:** ${horaBrasil}`;
    document.getElementById('hora-ny').innerHTML = `**New York:** ${horaNY}`;
    document.getElementById('hora-hk').innerHTML = `**Hong Kong:** ${horaHK}`;
}
// O intervalo de 1s já será feito no index.html