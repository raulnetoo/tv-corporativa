// js/sheets_config.js

// URL DE IMPLANTAÇÃO DO GOOGLE APPS SCRIPT
// Esta URL acessa o script que converte as abas da sua planilha em JSON.
const GOOGLE_SHEET_MACRO_URL = 'https://script.google.com/macros/s/AKfycbwFw9x2EckNeuHY8QbZ6j13DCi_PvBQI7KFCkiRoeffqiBCcoKdLplg46Ls8B7j6N1NSQ/exec'; 

/**
 * Busca dados de uma aba específica do Google Sheets usando a macro URL.
 * SUBSTITUÍDO: async/await e fetch por XMLHttpRequest e Promise.
 * * @param {string} sheetName - O nome exato da aba (ex: 'Noticia', 'Aniversariante').
 * @returns {Promise<Array<Object>>} - Uma promessa que resolve para um array de objetos JSON.
 */
function fetchSheetData(sheetName) {
    const url = `${GOOGLE_SHEET_MACRO_URL}?sheet=${sheetName}`;

    return new Promise((resolve, reject) => {
        
        // 1. Cria o objeto de requisição (compatível com navegadores antigos)
        const xhr = new XMLHttpRequest();
        xhr.open('GET', url);

        // 2. Define o que acontece após o carregamento da requisição
        xhr.onload = function() {
            if (xhr.status >= 200 && xhr.status < 300) {
                try {
                    // Tenta fazer o parse do JSON
                    const data = JSON.parse(xhr.responseText);
                    
                    // Verifica se a resposta contém um erro de script (JSON retornado pelo Apps Script)
                    if (data && data.error) {
                        console.error(`Erro retornado do Google Apps Script para a aba ${sheetName}:`, data.error);
                        resolve([]); // Resolve com array vazio (sucesso, mas dados vazios)
                        return;
                    }

                    // Se tudo estiver OK, resolve a Promise com os dados
                    resolve(data);
                } catch (e) {
                    // Erro no parse do JSON (resposta inválida)
                    console.error(`Erro ao processar o JSON para a aba ${sheetName}:`, e);
                    resolve([]); // Resolve com array vazio
                }
            } else {
                // Erro HTTP (404, 500, etc.)
                console.error(`Erro na requisição para a aba ${sheetName}. Status: ${xhr.status}`);
                resolve([]); // Resolve com array vazio (para não quebrar o código cliente)
            }
        };

        // 3. Define o que acontece em caso de erro de rede (Ex: CORS, conexão offline)
        xhr.onerror = function() {
            console.error(`Erro de rede ao buscar dados para a aba ${sheetName}.`);
            resolve([]); // Resolve com array vazio para tratamento elegante
        };

        // 4. Envia a requisição
        xhr.send();
    });
}