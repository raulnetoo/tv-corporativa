// js/sheets_config.js

// URL DE IMPLANTAÇÃO DO GOOGLE APPS SCRIPT
// Esta URL acessa o script que converte as abas da sua planilha em JSON.
const GOOGLE_SHEET_MACRO_URL = 'https://script.google.com/macros/s/AKfycbwFw9x2EckNeuHY8QbZ6j13DCi_PvBQI7KFCkiRoeffqiBCcoKdLplg46Ls8B7j6N1NSQ/exec'; 

/**
 * Busca dados de uma aba específica do Google Sheets usando a macro URL.
 * @param {string} sheetName - O nome exato da aba (ex: 'Noticia', 'Aniversariante').
 * @returns {Promise<Array<Object>>} - Uma promessa que resolve para um array de objetos JSON.
 */
async function fetchSheetData(sheetName) {
    const url = `${GOOGLE_SHEET_MACRO_URL}?sheet=${sheetName}`;
    
    try {
        const response = await fetch(url);
        
        if (!response.ok) {
            console.error(`Erro na requisição para a aba ${sheetName}. Status: ${response.status}`);
            return []; // Retorna array vazio em caso de erro HTTP
        }
        
        // Verifica se a resposta contém um erro de script (JSON retornado pelo Apps Script)
        const data = await response.json();
        if (data && data.error) {
             console.error(`Erro retornado do Google Apps Script para a aba ${sheetName}:`, data.error);
             return [];
        }

        // Se tudo estiver OK, retorna os dados
        return data;

    } catch (error) {
        console.error(`Erro de rede ou ao processar o JSON para a aba ${sheetName}:`, error);
        return []; // Retorna array vazio em caso de falha de rede/parse
    }
}

// Esta função será usada nos arquivos noticia.js e aniversariante.js
// Ex: const noticias = await fetchSheetData('Noticia');