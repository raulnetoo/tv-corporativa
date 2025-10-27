// js/video.js

// Lista de URLs dos seus vídeos MP4 (Ajuste este array)
const VIDEO_URLS = [
    'videos/01.mp4',
    'videos/02.mp4',
    'videos/03.mp4',
    'videos/04.mp4',
    'videos/05.mp4',
    'videos/07.mp4',
    'videos/08.mp4',
    'videos/09.mp4',
    'videos/10.mp4',
    'videos/11.mp4',
    'videos/12.mp4',
    'videos/13.mp4',
    'videos/14.mp4'
];

let shuffledVideos = []; // Novo array para a ordem aleatória
let videoIndex = 0;

/**
 * Função utilitária para embaralhar um array (algoritmo Fisher-Yates).
 * @param {Array} array O array a ser embaralhado.
 * @returns {Array} O array embaralhado.
 */
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]]; // Troca elementos
    }
    return array;
}

function loadVideo() {
    const videoContainer = document.getElementById('video-container');
    
    // 1. Embaralha a lista de vídeos APENAS na primeira chamada ou quando for necessário redefinir.
    // Assim, a sequência de reprodução dentro do loop será aleatória, mas a ordem não mudará a cada vídeo.
    shuffledVideos = shuffleArray([...VIDEO_URLS]);
    videoIndex = 0; // Inicia a contagem no primeiro da lista embaralhada

    // 2. Cria o elemento <video>
    videoContainer.innerHTML = `
        <video id="tv-video-player" width="100%" height="100%" autoplay muted playsinline style="border-radius: var(--borda-raio);">
            Seu navegador não suporta a tag de vídeo.
        </video>
    `;
    
    const player = document.getElementById('tv-video-player');

    // Função para carregar e iniciar o próximo vídeo da lista EMBARALHADA
    const playProximoVideo = () => {
        if (shuffledVideos.length === 0) {
            console.error("Nenhuma URL de vídeo configurada ou lista vazia após embaralhamento.");
            return;
        }

        // Define a source com base no array EMBARALHADO
        player.src = shuffledVideos[videoIndex];
        player.load();
        
        console.log(`Reproduzindo vídeo: ${shuffledVideos[videoIndex]}`);

        player.play().catch(error => {
            console.warn("Reprodução automática bloqueada. Garanta que o vídeo está mudo e tente novamente.", error);
        });

        // 3. Prepara o índice para o próximo loop (dentro da lista embaralhada)
        videoIndex++;

        // Se o índice atingir o fim da lista embaralhada, embaralha NOVAMENTE
        if (videoIndex >= shuffledVideos.length) {
            console.log("Fim do ciclo aleatório. Embaralhando a lista novamente.");
            shuffledVideos = shuffleArray([...VIDEO_URLS]); // Cria uma nova ordem
            videoIndex = 0; // Volta para o início da nova ordem
        }
    };

    // Evento que dispara a troca de vídeo ao término
    player.addEventListener('ended', playProximoVideo);

    // Inicia o primeiro vídeo da ordem embaralhada
    playProximoVideo(); 
}