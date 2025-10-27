// Depende de sheets_config.js (fetchSheetData)

let aniversariantesDoMesList = [];
let aniversarianteIndex = 0;
const BASE_DURATION = 10000; // 10 segundos para item normal
const EXTRA_DELAY = 10000;  // 10 segundos adicionais para o último item (total de 20s)

// Função utilitária para extrair o dia e o mês (DD, MM) de uma string de data ISO.
function parseAniversario(isoString) {
    if (!isoString) return null;
    
    const date = new Date(isoString);
    
    if (isNaN(date.getTime())) {
        // Tenta fallback para data simples DD/MM se a ISO falhar (redundância)
        const match = String(isoString).match(/(\d{1,2})\/(\d{1,2})/);
        if (match) return [Number(match[1]), Number(match[2])];
        return null;
    }

    // Usa Intl.DateTimeFormat para extrair dia e mês de forma segura e local
    const options = { day: '2-digit', month: '2-digit', timeZone: 'UTC' };
    const formatter = new Intl.DateTimeFormat('pt-BR', options);
    const parts = formatter.formatToParts(date);

    const dia = Number(parts.find(p => p.type === 'day').value);
    const mes = Number(parts.find(p => p.type === 'month').value);

    return [dia, mes]; // Retorna [Dia, Mês]
}


async function fetchAniversariantesDoMes() {
    const dataAtual = new Date();
    const mesHoje = dataAtual.getMonth() + 1; // Mês atual (1 a 12)
    const nomeMes = new Intl.DateTimeFormat('pt-BR', { month: 'long' }).format(dataAtual);
    const nomeMesMaiusculo = nomeMes.charAt(0).toUpperCase() + nomeMes.slice(1);

    try {
        const todosAniversariantes = await fetchSheetData('Aniversariante'); 
        
        aniversariantesDoMesList = todosAniversariantes
            .filter(p => {
                const dataPartes = parseAniversario(p.aniversario);
                
                if (!dataPartes) return false;
                
                const [diaAniversario, mesAniversario] = dataPartes;
                
                // Filtra apenas se o mês for o atual
                return mesAniversario === mesHoje;
            })
            // Ordena pelo dia do aniversário (para exibir em ordem cronológica)
            .sort((a, b) => {
                const diaA = parseAniversario(a.aniversario)?.[0] || 99;
                const diaB = parseAniversario(b.aniversario)?.[0] || 99;
                return diaA - diaB;
            });

        if (aniversariantesDoMesList.length === 0) {
            displaySemAniversariante(nomeMesMaiusculo);
            return;
        }
        
        startAniversarianteLoop(); 

    } catch (error) {
        console.error("Erro ao carregar lista de Aniversariantes do Mês:", error);
        displaySemAniversariante(nomeMesMaiusculo);
    }
}


function displaySemAniversariante(nomeMes) {
    document.getElementById('aniversariante-nome').textContent = `Aniversariantes de ${nomeMes.toUpperCase()}`;
    document.getElementById('aniversariante-data').textContent = 'Nenhum Aniversariante neste mês.';
    document.getElementById('aniversariante-setor').textContent = 'Parabéns a todos!';
    document.getElementById('aniversariante-foto').src = 'https://via.placeholder.com/100?text=TV'; 
    document.getElementById('secao-aniversariante').style.backgroundColor = 'var(--cor-secundaria)';
}


// Função para exibir o aniversariante atual no DOM
function displayAniversariante() {
    if (aniversariantesDoMesList.length === 0) return;

    const dados = aniversariantesDoMesList[aniversarianteIndex];
    const dataPartes = parseAniversario(dados.aniversario);

    if (!dataPartes) return; 
    
    const [diaAniversario, mesAniversario] = dataPartes;

    // Obtém o nome do mês a partir do número do mês 
    const dataMes = new Date(2000, mesAniversario - 1, 1); 
    const nomeMes = new Intl.DateTimeFormat('pt-BR', { month: 'long' }).format(dataMes);
    const nomeMesMaiusculo = nomeMes.charAt(0).toUpperCase() + nomeMes.slice(1);


    // Atualiza o DOM
    document.getElementById('aniversariante-nome').textContent = dados.nome;
    document.getElementById('aniversariante-data').textContent = `Dia ${diaAniversario} de ${nomeMesMaiusculo}`;
    document.getElementById('aniversariante-setor').textContent = `Setor: ${dados.setor}`;
    document.getElementById('aniversariante-foto').src = dados.foto_url; 
    document.getElementById('secao-aniversariante').style.backgroundColor = '#4CAF50'; 
}


function startAniversarianteLoop() {
    
    function loopCycle() {
        if (aniversariantesDoMesList.length === 0) return;

        // 1. Exibir o conteúdo atual
        displayAniversariante();

        // 2. Determinar se o item exibido AGORA é o último
        const isLastItem = (aniversarianteIndex === aniversariantesDoMesList.length - 1);

        // 3. Avançar o índice para o próximo ciclo
        aniversarianteIndex = (aniversarianteIndex + 1) % aniversariantesDoMesList.length;

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