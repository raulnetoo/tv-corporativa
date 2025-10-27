// js/video.js

// -------------------------------------------------------------
// CONFIGURAÇÃO
// -------------------------------------------------------------

// Assuma que seus vídeos estão no caminho: 'assets/videos/01.mp4'
const VIDEO_PATH = 'assets/videos/';

// Número total de vídeos disponíveis (Se você tiver 15, mude para 15)
const TOTAL_VIDEOS = 14; 

// -------------------------------------------------------------
// LÓGICA DE REPRODUÇÃO
// -------------------------------------------------------------

let playlist = []; // Armazena a lista de vídeos embaralhada
let videoIndex = 0; // Índice do vídeo atual na playlist

/**
 * Função utilitária para embaralhar um array (Algoritmo Fisher-Yates).
 * @param {Array} array - O array a ser embaralhado.
 * @returns {Array} O array embaralhado.
 */
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

/**
 * Cria a playlist inicial (01.mp4 a 14.mp4) e a embaralha.
 */
function initializePlaylist() {
    let initialList = [];
    for (let i = 1; i <= TOTAL_VIDEOS; i++) {
        // Formato: 'assets/videos/01.mp4'
        const fileName = i.toString().padStart(2, '0') + '.mp4';
        initialList.push(VIDEO_PATH + fileName);
    }
    
    // Embaralha a lista e atribui à playlist
    playlist = shuffleArray(initialList);
    videoIndex = 0;
    console.log("Playlist inicializada e embaralhada. Total de vídeos:", playlist.length);
}

/**
 * Reproduz o vídeo atual na playlist.
 */
function playNextVideo() {
    const videoElement = document.getElementById('main-video');

    if (!videoElement) {
        console.error("Elemento de vídeo não encontrado (ID: main-video).");
        return;
    }

    if (playlist.length === 0) {
        // Recria a playlist se, por algum motivo, ela estiver vazia
        initializePlaylist();
        if (playlist.length === 0) {
            console.error("Não foi possível criar a lista de vídeos.");
            return;
        }
    }

    // 1. Define a fonte do vídeo atual
    videoElement.src = playlist[videoIndex];
    
    // 2. Tenta reproduzir o vídeo (Pode falhar em alguns navegadores devido à política de autoplay)
    videoElement.play().catch(error => {
        console.warn("Autoplay falhou. Garanta que o navegador permita autoplay ou que o vídeo não tenha áudio.");
    });
    
    console.log(`Reproduzindo: ${playlist[videoIndex]} (Índice: ${videoIndex + 1}/${playlist.length})`);
    
    // 3. Incrementa o índice para o próximo vídeo
    videoIndex++;
}

/**
 * Configura o listener para quando um vídeo terminar.
 */
function setupVideoLoop() {
    const videoElement = document.getElementById('main-video');

    if (!videoElement) return;

    videoElement.addEventListener('ended', () => {
        
        // Verifica se chegamos ao final da playlist atual
        if (videoIndex >= playlist.length) {
            // Embaralha a lista novamente para um novo ciclo aleatório
            initializePlaylist(); 
            console.log("Fim do ciclo da playlist. Reembaralhando e reiniciando.");
        }
        
        // Reproduz o próximo vídeo na lista embaralhada
        playNextVideo();
    });
}

/**
 * Função principal a ser chamada no index.html
 */
function loadVideo() {
    initializePlaylist();
    setupVideoLoop();
    playNextVideo(); // Começa a reprodução do primeiro vídeo aleatório
}