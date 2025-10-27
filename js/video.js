// Lista de URLs dos seus vídeos MP4 (Ajuste este array)
const VIDEO_URLS = [
    'videos/01.mp4',
    'videos/02.mp4',
    'videos/03.mp4',
    'videos/04.mp4',
    'videos/05.mp4',
    'videos/06.mp4',
    'videos/07.mp4',
    'videos/08.mp4',
    'videos/09.mp4',
    'videos/10.mp4',
    'videos/11.mp4',
    'videos/12.mp4',
    'videos/13.mp4',
    'videos/14.mp4'
];

let videoIndex = 0;

function loadVideo() {
    const videoContainer = document.getElementById('video-container');
    videoContainer.innerHTML = `
        <video id="tv-video-player" width="100%" height="100%" autoplay muted playsinline style="border-radius: var(--borda-raio);">
            Seu navegador não suporta a tag de vídeo.
        </video>
    `;
    
    const player = document.getElementById('tv-video-player');

    // Função para carregar e iniciar o próximo vídeo
    const playProximoVideo = () => {
        if (VIDEO_URLS.length === 0) {
            console.error("Nenhuma URL de vídeo configurada.");
            return;
        }

        player.src = VIDEO_URLS[videoIndex];
        player.load();
        player.play().catch(error => {
            console.warn("Reprodução automática bloqueada. Garanta que o vídeo está mudo.", error);
        });

        // Prepara o índice para o próximo loop
        videoIndex = (videoIndex + 1) % VIDEO_URLS.length;
    };

    // Evento que dispara a troca de vídeo ao término
    player.addEventListener('ended', playProximoVideo);

    // Inicia o primeiro vídeo
    playProximoVideo(); 
}