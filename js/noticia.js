// Depende de sheets_config.js (fetchSheetData)

let noticiasList = [];
let noticiaIndex = 0;
const SLIDE_DURATION = 10000; // 10 segundos

let loopInterval; // Variável para controlar o setInterval

async function fetchNoticias() {
    try {
        const novosDados = await fetchSheetData('Noticia'); 
        
        if (novosDados.length === 0) {
            document.getElementById('noticia-titulo').textContent = 'Sem Notícias para Exibir';
            document.getElementById('noticia-texto').textContent = 'Verifique a aba Noticia no Google Sheets.';
            document.getElementById('noticia-imagem').src = 'placeholder.jpg';
            
            if (loopInterval) {
                clearInterval(loopInterval);
            }
            return;
        }

        noticiasList = novosDados;

        // 1. Limpa o loop antigo (necessário para a atualização a cada 2 minutos)
        if (loopInterval) {
            clearInterval(loopInterval);
        }

        // 2. Reseta o índice e exibe a primeira notícia
        noticiaIndex = 0;
        displayProximaNoticia(); 
        
        // 3. Inicia o novo loop
        loopInterval = setInterval(displayProximaNoticia, SLIDE_DURATION);

    } catch (error) {
        console.error("Erro ao carregar lista de Notícias:", error);
        document.getElementById('noticia-titulo').textContent = 'Erro de Conexão';
        document.getElementById('noticia-texto').textContent = 'Não foi possível carregar os dados do Google Sheets.';
        document.getElementById('noticia-imagem').src = 'placeholder.jpg';
    }
}

function displayProximaNoticia() {
    if (noticiasList.length === 0) return;

    const itemAtual = noticiasList[noticiaIndex];

    const titulo = itemAtual.titulo || 'Título Padrão';
    const texto = itemAtual.descricao || 'Descrição Padrão.';
    const imagemUrl = itemAtual.imagem_url || 'placeholder.jpg'; 

    // Atualiza o DOM
    document.getElementById('noticia-titulo').textContent = titulo;
    document.getElementById('noticia-texto').textContent = texto;
    document.getElementById('noticia-imagem').src = imagemUrl;
    
    // Avança para a próxima, voltando para o início (loop)
    noticiaIndex = (noticiaIndex + 1) % noticiasList.length;
}