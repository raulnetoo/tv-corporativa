// Depende de sheets_config.js (fetchSheetData) - NOTA: Esta função DEVE retornar uma Promise.

let aniversariantesDoMesList = [];
let aniversarianteIndex = 0;
const BASE_DURATION = 10000; // 10 segundos para item normal
const EXTRA_DELAY = 10000;  // 10 segundos adicionais para o último item (total de 20s)
const DIA_LIMITE_TRANSICAO = 20; 

let loopTimeout;

// As funções utilitárias (parseAniversario, getNomeMes) não usam APIs JS modernas,
// então as manteremos inalteradas, pois o problema não está aqui.

// Função utilitária para extrair o dia e o mês (DD, MM) de uma string de data ISO/DDMM.
function parseAniversario(isoString) {
    if (!isoString) return null;
    
    // Tenta primeiro o parsing via Date (funciona bem para YYYY-MM-DD)
    const date = new Date(isoString);
    
    if (!isNaN(date.getTime())) {
        // NOTA: Intl.DateTimeFormat pode ser um ponto de falha em navegadores antigos,
        // mas é o método mais seguro para datas. Se houver problemas, precisaremos de um fallback manual.
        const options = { day: '2-digit', month: '2-digit', timeZone: 'UTC' };
        const formatter = new Intl.DateTimeFormat('pt-BR', options);
        const parts = formatter.formatToParts(date);

        const dia = Number(parts.find(p => p.type === 'day').value);
        const mes = Number(parts.find(p => p.type === 'month').value);

        return [dia, mes]; // Retorna [Dia, Mês]
    }

    // Fallback: Tenta parsing de strings no formato DD/MM 
    const match = String(isoString).match(/(\d{1,2})\/(\d{1,2})/);
    if (match) return [Number(match[1]), Number(match[2])];
    
    return null;
}

// Função auxiliar para obter o nome do mês a partir do número (1=Jan, 12=Dez)
function getNomeMes(mes) {
    // Depende também de Intl.DateTimeFormat. Mantenha por enquanto.
    const dataMes = new Date(2000, mes - 1, 1); 
    const nomeMes = new Intl.DateTimeFormat('pt-BR', { month: 'long' }).format(dataMes);
    return nomeMes.charAt(0).toUpperCase() + nomeMes.slice(1);
}

/**
 * REVISADA: Usa .then() e .catch() em vez de async/await.
 */
function fetchAniversariantesDoMes() {
    const dataAtual = new Date();
    const diaHoje = dataAtual.getDate();
    const mesHoje = dataAtual.getMonth() + 1; 
    const mesProximo = (mesHoje % 12) + 1; 
    let mesExibido = mesHoje; 

    // Inicia a chamada à função que deve retornar uma Promise
    fetchSheetData('Aniversariante') 
        .then(todosAniversariantes => {
            
            // --- 1. Filtrar Mês Atual e Mês Próximo ---
            const filtroMes = (mes) => (p) => {
                const dataPartes = parseAniversario(p.aniversario);
                return dataPartes && dataPartes[1] === mes;
            };

            const currentMonthList = todosAniversariantes.filter(filtroMes(mesHoje));
            const nextMonthList = todosAniversariantes.filter(filtroMes(mesProximo));
            
            // --- 2. Decidir a Lista Final ---
            let listaParaExibir = [];

            if (currentMonthList.length === 0) {
                listaParaExibir = nextMonthList;
                mesExibido = mesProximo;
                console.log("Mês atual sem aniversariantes. Exibindo próximo mês.");

            } else if (diaHoje >= DIA_LIMITE_TRANSICAO) {
                listaParaExibir = [
                    ...currentMonthList.filter(p => (parseAniversario(p.aniversario)?.[0] || 0) >= diaHoje), 
                    ...nextMonthList 
                ];
                
                if (listaParaExibir.length === 0) {
                     listaParaExibir = currentMonthList;
                } else {
                     mesExibido = mesProximo;
                }
                console.log("Fim do mês. Mesclando aniversariantes restantes com o próximo mês.");
                
            } else {
                listaParaExibir = currentMonthList;
                console.log("Início/Meio do mês. Exibindo apenas aniversariantes do mês atual.");
            }


            // --- 3. Ordenar a Lista Final e Iniciar Loop ---

            // Função de ordenação: (código inalterado)
            listaParaExibir.sort((a, b) => {
                const [diaA, mesA] = parseAniversario(a.aniversario) || [99, 99];
                const [diaB, mesB] = parseAniversario(b.aniversario) || [99, 99];
                
                if (mesA !== mesB) return mesA - mesB;
                return diaA - diaB;
            });

            aniversariantesDoMesList = listaParaExibir;

            if (aniversariantesDoMesList.length === 0) {
                displaySemAniversariante(mesExibido);
                return;
            }
            
            // Limpa o loop anterior (se estiver ativo)
            if (loopTimeout) {
                clearTimeout(loopTimeout);
            }
            
            // Reinicia o índice e o loop
            aniversarianteIndex = 0;
            startAniversarianteLoop(); 

        }) // Fim do .then()
        .catch(error => {
            console.error("Erro ao carregar lista de Aniversariantes do Mês (WebOS compatível):", error);
            displaySemAniversariante(mesHoje); // Fallback
        }); // Fim do .catch()
}


function displaySemAniversariante(mesConsultado) {
    // ... código inalterado
    const nomeMes = getNomeMes(mesConsultado).toUpperCase();
    
    document.getElementById('aniversariante-nome').textContent = `Aniversariantes de ${nomeMes}`;
    document.getElementById('aniversariante-data').textContent = 'Nenhum Aniversariante encontrado.';
    document.getElementById('aniversariante-setor').textContent = 'Felicidades!';
    document.getElementById('aniversariante-foto').src = 'https://via.placeholder.com/100?text=TV'; 
    document.getElementById('secao-aniversariante').style.backgroundColor = 'var(--cor-secundaria)';
}


function displayAniversariante() {
    // ... código inalterado
    if (aniversariantesDoMesList.length === 0) return;

    const dados = aniversariantesDoMesList[aniversarianteIndex];
    const dataPartes = parseAniversario(dados.aniversario);

    if (!dataPartes) return; 
    
    const [diaAniversario, mesAniversario] = dataPartes;
    const nomeMesMaiusculo = getNomeMes(mesAniversario);

    // Atualiza o DOM
    document.getElementById('aniversariante-nome').textContent = dados.nome;
    document.getElementById('aniversariante-data').textContent = `Dia ${diaAniversario} de ${nomeMesMaiusculo}`;
    document.getElementById('aniversariante-setor').textContent = `Setor: ${dados.setor}`;
    document.getElementById('aniversariante-foto').src = dados.foto_url;
    
    // NOVO: Chama o confete toda vez que um novo aniversariante é exibido!
    shootConfetti(); 
}


function startAniversarianteLoop() {
    // ... código inalterado
    function loopCycle() {
        if (aniversariantesDoMesList.length === 0) return;

        displayAniversariante();

        const isLastItem = (aniversarianteIndex === aniversariantesDoMesList.length - 1);

        aniversarianteIndex = (aniversarianteIndex + 1) % aniversariantesDoMesList.length;

        let delay = BASE_DURATION;
        if (isLastItem) {
            delay += EXTRA_DELAY; 
        }

        loopTimeout = setTimeout(loopCycle, delay);
    }
    
    loopCycle(); 
}

function shootConfetti() {
    // ... código inalterado (confetti.js já está carregado via CDN no HTML)
    const confettiCanvas = document.getElementById('confetti-canvas');
    if (!confettiCanvas) return;

    const myConfetti = confetti.create(confettiCanvas, { 
        resize: true,
        useDpr: true 
    });

    const coresFesta = ['#2dd3e9', '#ffffff', '#FFD700', '#FF1493'];

    let particleScalar = 1; 
    let baseVelocity = 40; 
    let secondWaveDelay = 500; 

    if (window.innerWidth >= 3000 && window.innerHeight >= 1800) {
        particleScalar = 2; 
        baseVelocity = 55;    
        secondWaveDelay = 500; 
    }

// --- Onda 1 ---
    myConfetti({
        particleCount: 80,         
        spread: 70,                
        startVelocity: baseVelocity, 
        decay: 0.9,                
        gravity: 0.8,              
        ticks: 250,                
        origin: { y: 0.2, x: 0.5},
        colors: coresFesta,
        scalar: particleScalar     
    });

// --- Onda 2 ---
    setTimeout(() => {
        myConfetti({
            particleCount: 120,        
            spread: 120,               
            startVelocity: baseVelocity * 0.6, 
            decay: 0.92,               
            gravity: 0.6,              
            ticks: 350,                
            origin: { y: 0, x: 0.5 },  
            colors: coresFesta,
            shapes: ['circle', 'square'],
            scalar: particleScalar     
        });
    }, secondWaveDelay); 
}