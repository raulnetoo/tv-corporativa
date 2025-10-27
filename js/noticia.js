// Depende de sheets_config.js (fetchSheetData)

let noticiasList = [];
let noticiaIndex = 0;
const SLIDE_DURATION = 10000; // 10 segundos

let loopInterval; // Variável para controlar o setInterval

async function fetchNoticias() {
    try {
        // Busca todos os dados da aba 'Noticia'
        noticiasList = await fetchSheetData('Noticia'); 
        
        if (noticiasList.length === 0) {
            document.getElementById('noticia-titulo').textContent = 'Sem Notícias para Exibir';
            document.getElementById('noticia-texto').textContent = 'Verifique a aba Noticia no Google Sheets.';
            document.getElementById('noticia-imagem').src = 'placeholder.jpg';
            return;
        }

        // Limpa o loop antigo (necessário para quando busca novos dados a cada 2 minutos)
        if (loopInterval) {
            clearInterval(loopInterval);
        }

        // Reseta o índice e exibe a primeira notícia
        noticiaIndex = 0;
        displayProximaNoticia(); 
        
        // Inicia o novo loop
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

    // ATENÇÃO: Verifique no seu JSON que as chaves estão exatamente assim:
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

// Nota: A chamada 'fetchNoticias()' deve estar no seu index.html