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

let shuffledVideos = []; 
let videoIndex = 0;

/**
 * Função utilitária para embaralhar um array (Fisher-Yates - Compatível com ES5).
 */
function shuffleArray(array) {
    let temp, j;

    for (let i = array.length - 1; i > 0; i--) {
        j = Math.floor(Math.random() * (i + 1));
        
        // Troca clássica (Garante compatibilidade máxima)
        temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
    return array;
}

function loadVideo() {
    const videoContainer = document.getElementById('video-container');
    
    // 1. Embaralha a lista de vídeos APENAS na primeira chamada
    shuffledVideos = shuffleArray([...VIDEO_URLS]);
    videoIndex = 0; 

    // 2. Cria o elemento <video>
    // Mantemos as flags (autoplay, muted, playsinline) que são cruciais
    videoContainer.innerHTML = `
        <video id="tv-video-player" width="100%" height="100%" autoplay muted playsinline style="border-radius: var(--borda-raio);">
            Seu navegador não suporta a tag de vídeo.
        </video>
    `;
    
    const player = document.getElementById('tv-video-player');

    // Função para carregar e iniciar o próximo vídeo da lista EMBARALHADA
    const playProximoVideo = () => {
        if (shuffledVideos.length === 0) {
            console.error("Nenhuma URL de vídeo configurada.");
            return;
        }

        // Define a source
        player.src = shuffledVideos[videoIndex];
        player.load();
        
        console.log(`Reproduzindo vídeo: ${shuffledVideos[videoIndex]}`);

        // REVISADO: Tentativa de play simples (compatível com navegadores antigos)
        player.play(); 

        // 3. Prepara o índice para o próximo loop
        videoIndex++;

        // Se o índice atingir o fim da lista, embaralha NOVAMENTE
        if (videoIndex >= shuffledVideos.length) {
            console.log("Fim do ciclo aleatório. Embaralhando a lista novamente.");
            shuffledVideos = shuffleArray([...VIDEO_URLS]); 
            videoIndex = 0; 
        }
    };

    // Evento que dispara a troca de vídeo ao término
    player.addEventListener('ended', playProximoVideo);

    // Inicia o primeiro vídeo da ordem embaralhada
    playProximoVideo(); 
}