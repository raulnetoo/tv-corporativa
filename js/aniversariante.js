// Depende de sheets_config.js (fetchSheetData)

let aniversariantesDoMesList = [];
let aniversarianteIndex = 0;
const BASE_DURATION = 10000; // 10 segundos para item normal
const EXTRA_DELAY = 10000;  // 10 segundos adicionais para o último item (total de 20s)
const DIA_LIMITE_TRANSICAO = 20; // NOVO: A partir do dia 20, já incluímos o próximo mês.

let loopTimeout;

// Função utilitária para extrair o dia e o mês (DD, MM) de uma string de data ISO/DDMM.
function parseAniversario(isoString) {
    if (!isoString) return null;
    
    // Tenta primeiro o parsing via Date (funciona bem para YYYY-MM-DD)
    const date = new Date(isoString);
    
    if (!isNaN(date.getTime())) {
        // Se a data for válida, usa Intl.DateTimeFormat para evitar problemas de timezone
        // Força 'UTC' para garantir que dia/mês sejam lidos corretamente
        const options = { day: '2-digit', month: '2-digit', timeZone: 'UTC' };
        const formatter = new Intl.DateTimeFormat('pt-BR', options);
        const parts = formatter.formatToParts(date);

        const dia = Number(parts.find(p => p.type === 'day').value);
        const mes = Number(parts.find(p => p.type === 'month').value);

        return [dia, mes]; // Retorna [Dia, Mês]
    }

    // Fallback: Tenta parsing de strings no formato DD/MM (como você já tinha)
    const match = String(isoString).match(/(\d{1,2})\/(\d{1,2})/);
    if (match) return [Number(match[1]), Number(match[2])];
    
    return null;
}

// NOVO: Função auxiliar para obter o nome do mês a partir do número (1=Jan, 12=Dez)
function getNomeMes(mes) {
    // Cria uma data fictícia no ano 2000 para formatar o nome do mês
    const dataMes = new Date(2000, mes - 1, 1); 
    const nomeMes = new Intl.DateTimeFormat('pt-BR', { month: 'long' }).format(dataMes);
    return nomeMes.charAt(0).toUpperCase() + nomeMes.slice(1);
}

async function fetchAniversariantesDoMes() {
    const dataAtual = new Date();
    const diaHoje = dataAtual.getDate();
    const mesHoje = dataAtual.getMonth() + 1; // Mês atual (1 a 12)
    const mesProximo = (mesHoje % 12) + 1; // Próximo mês (1 a 12)
    let mesExibido = mesHoje; // Variável para rastrear qual mês estamos exibindo

    try {
        const todosAniversariantes = await fetchSheetData('Aniversariante'); 
        
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
            // Cenário A: Mês atual VAZIO -> Exibir próximo mês imediatamente
            listaParaExibir = nextMonthList;
            mesExibido = mesProximo;
            console.log("Mês atual sem aniversariantes. Exibindo próximo mês.");

        } else if (diaHoje >= DIA_LIMITE_TRANSICAO) {
            // Cenário B: Mês atual NÃO VAZIO E FIM DE MÊS -> Mesclar e exibir
            listaParaExibir = [
                ...currentMonthList.filter(p => (parseAniversario(p.aniversario)?.[0] || 0) >= diaHoje), // Aniversariantes restantes deste mês
                ...nextMonthList // Todos do próximo mês
            ];
            // Se a mesclagem for vazia (só falta 1 dia no mês e ninguém no próximo): usa a lista completa do mês atual.
            if (listaParaExibir.length === 0) {
                 listaParaExibir = currentMonthList;
            } else {
                 mesExibido = mesProximo; // Indica que a lista inclui o próximo mês
            }
            console.log("Fim do mês. Mesclando aniversariantes restantes com o próximo mês.");
            
        } else {
            // Cenário C: Mês atual NÃO VAZIO E INÍCIO/MEIO DE MÊS -> Exibir apenas mês atual
            listaParaExibir = currentMonthList;
            console.log("Início/Meio do mês. Exibindo apenas aniversariantes do mês atual.");
        }


        // --- 3. Ordenar a Lista Final e Iniciar Loop ---

        // Função de ordenação: ordena por MÊS e depois por DIA. 
        // Importante quando a lista contém dois meses (mesclagem).
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

    } catch (error) {
        console.error("Erro ao carregar lista de Aniversariantes do Mês:", error);
        displaySemAniversariante(mesHoje); // Fallback
    }
}


function displaySemAniversariante(mesConsultado) {
    const nomeMes = getNomeMes(mesConsultado).toUpperCase();
    
    document.getElementById('aniversariante-nome').textContent = `Aniversariantes de ${nomeMes}`;
    document.getElementById('aniversariante-data').textContent = 'Nenhum Aniversariante encontrado.';
    document.getElementById('aniversariante-setor').textContent = 'Felicidades!';
    document.getElementById('aniversariante-foto').src = 'https://via.placeholder.com/100?text=TV'; 
    document.getElementById('secao-aniversariante').style.backgroundColor = 'var(--cor-secundaria)';
}


// Função para exibir o aniversariante atual no DOM (mantida)
function displayAniversariante() {
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
    
    function loopCycle() {
        if (aniversariantesDoMesList.length === 0) return;

        displayAniversariante();

        const isLastItem = (aniversarianteIndex === aniversariantesDoMesList.length - 1);

        aniversarianteIndex = (aniversarianteIndex + 1) % aniversariantesDoMesList.length;

        let delay = BASE_DURATION;
        if (isLastItem) {
            delay += EXTRA_DELAY; // Total de 20s no último item
        }

        loopTimeout = setTimeout(loopCycle, delay);
    }
    
    loopCycle(); 
}

function shootConfetti() {
    const confettiCanvas = document.getElementById('confetti-canvas');
    if (!confettiCanvas) return;

    const myConfetti = confetti.create(confettiCanvas, { 
        resize: true,
        useDpr: true 
    });

    const coresFesta = ['#2dd3e9', '#ffffff', '#FFD700', '#FF1493'];

    // NOVO: Parâmetros ajustáveis para 4K
    let particleScalar = 1;
    let baseVelocity = 40;
    let secondWaveDelay = 500;

    // Detecta se estamos em uma tela grande (4K ou similar)
    if (window.innerWidth >= 3000 && window.innerHeight >= 1800) {
        particleScalar = 2.5; // Torna os confetes 2.5x maiores
        baseVelocity = 65;    // Lança os confetes mais alto e rápido
        secondWaveDelay = 800; // Atraso maior entre as ondas para um efeito mais longo
    }

// --- Onda 1: Confetes mais concentrados e rápidos (efeito de "lançamento") ---
    myConfetti({
        particleCount: 80,         
        spread: 70,                
        startVelocity: baseVelocity, // Usa a velocidade ajustada
        decay: 0.9,                
        gravity: 0.8,              
        ticks: 250,                
        origin: { y: 0.2, x: 0.5},
        colors: coresFesta,
        scalar: particleScalar     // Aplica o novo tamanho
    });

// --- Onda 2: Confetes mais espalhados e lentos (efeito de "chuva") ---
    // Repetição para alongar o efeito de confete
    setTimeout(() => {
        myConfetti({
            particleCount: 120,        
            spread: 120,               
            startVelocity: baseVelocity * 0.6, // Velocidade menor para a chuva
            decay: 0.92,               
            gravity: 0.6,              
            ticks: 350,                
            origin: { y: 0, x: 0.5 },  
            colors: coresFesta,
            shapes: ['circle', 'square'],
            scalar: particleScalar     // Aplica o novo tamanho
        });
    }, secondWaveDelay); // Usa o atraso ajustado
}