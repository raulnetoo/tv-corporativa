// Depende de sheets_config.js (fetchSheetData)

let noticiasList = [];
let noticiaIndex = 0;
const BASE_DURATION = 10000; // 10 segundos para item normal
const EXTRA_DELAY = 10000;  // 10 segundos adicionais para o último item (total de 20s)

async function fetchNoticias() {
    try {
        // Busca todos os dados da aba 'Noticia'
        noticiasList = await fetchSheetData('Noticia'); 
        if (noticiasList.length === 0) {
            console.warn("Nenhuma notícia encontrada no Google Sheet.");
            return;
        }
        // Inicia o loop após carregar
        startNoticiaLoop(); 

    } catch (error) {
        console.error("Erro ao carregar lista de Notícias:", error);
    }
}

// Função para exibir a notícia atual no DOM
function displayNoticia() {
    if (noticiasList.length === 0) return;

    const itemAtual = noticiasList[noticiaIndex];

    // Colunas esperadas no Sheet: titulo, descricao, imagem_url
    document.getElementById('noticia-titulo').textContent = itemAtual.titulo || 'Título Padrão';
    document.getElementById('noticia-texto').textContent = itemAtual.descricao || 'Descrição Padrão.';
    document.getElementById('noticia-imagem').src = itemAtual.imagem_url || 'placeholder.jpg';
}


function startNoticiaLoop() {
    
    function loopCycle() {
        if (noticiasList.length === 0) return;
        
        // 1. Exibir o conteúdo atual
        displayNoticia();

        // 2. Determinar se o item exibido AGORA é o último
        const isLastItem = (noticiaIndex === noticiasList.length - 1);
        
        // 3. Avançar o índice para o próximo ciclo
        noticiaIndex = (noticiaIndex + 1) % noticiasList.length;

        // 4. Determinar o delay para a próxima exibição
        let delay = BASE_DURATION;
        if (isLastItem) {
            delay += EXTRA_DELAY; // 20000ms total (10s item + 10s extra)
        }

        // 5. Agendar a próxima execução do loop
        setTimeout(loopCycle, delay);
    }
    
    // Inicia o ciclo
    loopCycle(); 
}