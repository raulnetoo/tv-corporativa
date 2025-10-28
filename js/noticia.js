// Depende de sheets_config.js (fetchSheetData) - DEVE retornar uma Promise.

let noticiasList = [];
let noticiaIndex = 0;
const SLIDE_DURATION = 10000; // 10 segundos

let loopInterval; // Variável para controlar o setInterval

/**
 * REVISADA: Usa .then() e .catch() em vez de async/await.
 */
function fetchNoticias() {
    // A função fetchSheetData retorna uma Promise, então usamos .then()
    fetchSheetData('Noticia')
        .then(novosDados => {
            
            // Lógica de tratamento de dados bem-sucedida (corpo do antigo try)
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

            // 1. Limpa o loop antigo 
            if (loopInterval) {
                clearInterval(loopInterval);
            }

            // 2. Reseta o índice e exibe a primeira notícia
            noticiaIndex = 0;
            displayProximaNoticia(); 
            
            // 3. Inicia o novo loop
            loopInterval = setInterval(displayProximaNoticia, SLIDE_DURATION);

        }) // Fim do .then()
        .catch(error => {
            // Lógica de tratamento de erro (corpo do antigo catch)
            console.error("Erro ao carregar lista de Notícias (WebOS compatível):", error);
            document.getElementById('noticia-titulo').textContent = 'Erro de Conexão';
            document.getElementById('noticia-texto').textContent = 'Não foi possível carregar os dados do Google Sheets.';
            document.getElementById('noticia-imagem').src = 'placeholder.jpg';
        }); // Fim do .catch()
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