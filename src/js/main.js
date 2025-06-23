// Estado do jogo
let gameState = {
    playerLife: 5,
    maxLife: 5,
    currentPhase: 'Início',
    items: [],
    equippedItems: [], // Corrigido de 'equippedItem' para 'equippedItems' para consistência
    completedRegions: [],
    hasZGSword: false,
    battleState: null
};

const items = {
    'guia_atendimento': {
        name: 'Guia de Atendimento',
        description: 'Pergaminho que permite sortear 2 números por ataque',
        benefit: 'Sorteia 2 números por ataque',
        consequence: 'Nenhuma',
        image: '/src/assets/images/pergaminho.png'
    },
    'faturamentus': {
        name: 'Faturamentus',
        description: 'Placa de pedra que permite sortear 4 números por ataque',
        benefit: 'Sorteia 4 números por ataque',
        consequence: 'Se errar, próximo ataque inimigo +2 dano',
        image: '/src/assets/images/placa.png'
    },
    'estilingue_magico': {
        name: 'Estilingue Mágico',
        description: 'Permite atirar pedras teleguiadas com 50% de chance',
        benefit: 'Sorteia +5 números extras, pode atordoar inimigo',
        consequence: 'Após 3 erros, -1 vida ao usar',
        image: '/src/assets/images/estilingue.png'
    },
    'azah_transmissao': {
        name: 'Azah Transmissão',
        description: 'Dá habilidade de voo e poder extra',
        benefit: 'Sorteia +10 números por rodada',
        consequence: 'Se errar, dano baseado no último número sorteado',
        image: '/src/assets/images/capa.png'
    },
    'colar_estatua': {
        name: 'Colar da Estátua Sagrada',
        description: 'Poderoso artefato da estátua do último herói',
        benefit: 'Sorteia +10 números por ataque',
        consequence: '-3 vida ao usar',
        image: '/src/assets/images/colar.png'
    },
    'espada_zg': {
        name: 'Espada ZG',
        description: 'A lendária espada forjada com todos os artefatos',
        benefit: 'Sorteia 40 números por ataque, dano multiplicado',
        consequence: 'Nenhuma',
        image: '/src/assets/images/espada.png'
    }
};

const enemies = {
    'monstrengo': {
        name: 'Monstrengo',
        life: 3,
        diceCount: 1,
        dialogue: 'Bem-vindo, vejo que você é um dos escolhidos para enfraquecer Glozium...',
        image: '/src/assets/images/monstrengo.png'
    },
    'urso_sangrento': {
        name: 'Urso Sangrento',
        life: 6,
        diceCount: 2,
        dialogue: 'Finalmente diversão, esses anciões só sabem ficar anotando essas coisas inúteis.',
        image: '/src/assets/images/urso.png'
    },
    'dragao_transmissao': {
        name: 'Dragão da Transmissão',
        life: 12,
        diceCount: 3,
        dialogue: 'Você já tem sua arma... Fui guardião dessas terras, mas Glozium me tornou seu escravo. Livre-me do sofrimento!',
        image: '/src/assets/images/dragao.png'
    },
    'estatua_heroi': {
         name: 'Estátua do Último Herói',
         life: 25,
         diceCount: 5,
         dialogue: '(...) A Estátua do Último Herói não responde, apenas se prepara para lutar.',
         image: '/src/assets/images/estatua.png'
        },
    'glozium': {
        name: 'Glozium',
        life: 100,
        diceCount: 10,
        dialogue: 'Um rato invadiu meu recinto; talvez sirva de alimento para meus escravos.',
        image: '/src/assets/images/glozium.png'
    }
};

// Elementos do DOM
const storyArea = document.getElementById('storyArea');
const choicesArea = document.getElementById('choicesArea');
const playerHealthFill = document.getElementById('playerHealthFill');
const playerHealthText = document.getElementById('playerHealthText');
const currentPhaseSpan = document.getElementById('currentPhase');
const itemCountSpan = document.getElementById('itemCount');
const inventoryElement = document.getElementById('inventory'); // Referência ao elemento do inventário

// Funções do jogo
function updateUI() {
 // Atualizar barra de vida do menu principal
    const healthPercentage = (gameState.playerLife / gameState.maxLife) * 100;
    if (playerHealthFill) {
        playerHealthFill.style.width = `${healthPercentage}%`;
        
        // Aplicar classes de cor baseadas na porcentagem
        playerHealthFill.className = 'health-fill';
        if (healthPercentage > 60) {
            playerHealthFill.classList.add('high');
        } else if (healthPercentage > 30) {
            playerHealthFill.classList.add('medium');
        } else {
            playerHealthFill.classList.add('low');
        }
    }
    
    if (playerHealthText) {
        playerHealthText.textContent = `${gameState.playerLife}/${gameState.maxLife}`;
    }

    // Atualizar health bars da batalha (se existirem)
    updateBattleHealthBars();

    // Atualizar fase
    if (currentPhaseSpan) {
        currentPhaseSpan.textContent = gameState.currentPhase;
    }

    // Atualizar contagem de itens
    if (itemCountSpan) {
        itemCountSpan.textContent = gameState.items.length;
    }

    // Renderização do Inventário com Imagens
    const itemsList = document.getElementById('itemsList');
    if (itemsList) {
        if (gameState.items.length > 0) {
            itemsList.innerHTML = gameState.items.map(itemId => {
                const item = items[itemId];
                const equipped = gameState.equippedItems.includes(itemId) ? 'equipped' : '';
                return `
                    <div class="item-container ${equipped}" onclick="toggleEquip('${itemId}')" title="${item.description}">
                        <img src="${item.image}" alt="${item.name}" class="item-image">
                        <span class="item-name">${item.name} ${equipped ? '(Equipado)' : ''}</span>
                    </div>
                `;
            }).join('');
        } else {
            itemsList.innerHTML = '<p><em>Nenhum item coletado ainda.</em></p>';
        }
    }
}

function updateBattleHealthBars() {
    const battle = gameState.battleState;
    if (!battle) return;

    // Atualizar health bar do herói
    const heroHealthFill = document.getElementById('heroHealthFill');
    const heroHealthText = document.getElementById('heroHealthText');
    
    if (heroHealthFill && heroHealthText) {
        const heroHealthPercentage = (gameState.playerLife / gameState.maxLife) * 100;
        heroHealthFill.style.width = `${heroHealthPercentage}%`;
        
        // Aplicar classes baseadas na porcentagem de vida
        heroHealthFill.className = 'battle-health-fill';
        if (heroHealthPercentage > 60) {
            heroHealthFill.classList.add('high');
        } else if (heroHealthPercentage > 30) {
            heroHealthFill.classList.add('medium');
        } else {
            heroHealthFill.classList.add('low');
        }
        
        heroHealthText.textContent = `${gameState.playerLife}/${gameState.maxLife}`;
    }
    
    // Atualizar health bar do inimigo
    const enemyHealthFill = document.getElementById('enemyHealthFill');
    const enemyHealthText = document.getElementById('enemyHealthText');
    
    if (enemyHealthFill && enemyHealthText) {
        const enemyHealthPercentage = (battle.enemyLife / battle.enemyMaxLife) * 100;
        enemyHealthFill.style.width = `${enemyHealthPercentage}%`;
        // Aplicar classes baseadas na porcentagem de vida
        enemyHealthFill.className = 'battle-health-fill';
        if (enemyHealthPercentage > 60) {
            enemyHealthFill.classList.add('high');
        } else if (enemyHealthPercentage > 30) {
            enemyHealthFill.classList.add('medium');
        } else {
            enemyHealthFill.classList.add('low');
        }
        
        enemyHealthText.textContent = `${battle.enemyLife}/${battle.enemyMaxLife}`;
    }
}

function toggleEquip(itemId) {
    const index = gameState.equippedItems.indexOf(itemId);
    if (index > -1) {
        gameState.equippedItems.splice(index, 1); // Desequipa
    } else {
        gameState.equippedItems.push(itemId); // Equipa
    }
    updateUI();
}

function showStory(content, clear = true) {
    if (clear) {
        storyArea.innerHTML = '';
        choicesArea.innerHTML = '';
    }
    storyArea.innerHTML += content;
}

function showChoices(choices) {
    choicesArea.innerHTML = '';
    choices.forEach(choice => {
        const button = document.createElement('button');
        button.classList.add('choice-btn');
        button.textContent = choice.text;
        button.onclick = () => {
            // Esconde o inventário quando uma escolha é feita (se ele estiver visível)
            inventoryElement.classList.add('hidden');
            eval(choice.action); // Executa a ação
        };
        choicesArea.appendChild(button);
    });
}

function startGame() {
    gameState.playerLife = 5;
    gameState.maxLife = 5;
    gameState.currentPhase = 'Início';
    gameState.items = [];
    gameState.equippedItems = []; // Reinicia o array de itens equipados
    gameState.completedRegions = [];
    gameState.hasZGSword = false;
    gameState.battleState = null;

    updateUI();
    showMainMenu();
    inventoryElement.classList.add('hidden'); // Garante que o inventário esteja escondido no início
}

function resetGame() {
    startGame();
}

function showMainMenu() {
    gameState.currentPhase = 'Menu Principal';
    updateUI();
    showStory(`
        <div class="main-menu fade-in">
            <h3>Bem-vindo, Aventureiro!</h3>
            <p>Sua missão é derrotar o temível Glozium, o monstro imortal que ressurge a cada ano na província de Hospitalis.</p>
            <br>
            <p>Sua missão: explorar terras perigosas, resolver enigmas mágicos, fazer alianças, enfrentar criaturas e tomar decisões que definirão o destino do reino!</p>
            <br>
            <h5>Dica: Você precisa coletar os 4 artefatos sagrados das diferentes regiões para ter chance contra Glozium!</h5>
        </div>
    `);

    inventoryElement.classList.add('hidden'); // Esconde o inventário no menu principal

    const choices = [
        { text: 'Iniciar Jornada', action: 'showRegionSelection()' },
        { text: 'Reiniciar Jogo', action: 'resetGame()' }
    ];
    showChoices(choices);
}

function showRegionSelection() {
    gameState.currentPhase = 'Seleção de Região';
    updateUI();
    showStory(`
        <div class="fade-in">
            <h3>Escolha sua próxima aventura:</h3>
            <p>Para derrotar Glozium, você precisa coletar os 4 artefatos sagrados. Escolha sua próxima região.</p>
            ${gameState.hasZGSword ? '<p>Você forjou a Espada ZG! Agora pode enfrentar Glozium com força total.</p>' : ''}
        </div>
    `);

    inventoryElement.classList.add('hidden'); // Esconde o inventário ao selecionar região

    const choices = [
        { text: 'Floresta do Atendimentus', action: 'startRegion("floresta")' },
        { text: 'Cavernas de Faturamentus', action: 'startRegion("cavernas")' },
        { text: 'Vila da Transmissão', action: 'startRegion("vila")' },
        { text: 'Torre de Contas a Receber', action: 'startRegion("torre")' },
        { text: 'Enfrentar Glozium (Final)', action: 'fightGlozium()' }
    ];

        // Itens necessários para forjar a Espada ZG
        const requiredForgeItems = [
            'guia_atendimento',
            'faturamentus',
            'azah_transmissao',
            'colar_estatua'
        ];

    // Verifica se o jogador possui TODOS os itens necessários para a forja
    // E se a espada ZG ainda não foi forjada
    const canForge = requiredForgeItems.every(item => gameState.items.includes(item));
    if (canForge && !gameState.hasZGSword) { // Adicionado !gameState.hasZGSword para não mostrar depois de forjar
        choices.push({ text: 'Forjar Espada ZG', action: 'forgeZGSword()' });
    }

    choices.push({ text: 'Inventário', action: 'showItemManagementFromMenu()' });
    showChoices(choices);
}

function showItemManagementFromMenu() {
    gameState.currentPhase = 'Inventário';
    updateUI();
    showStory(`
        <h3>Gerenciar Itens</h3>
        <p>Clique nos itens para equipar ou desequipar.</p>
    `, true);
    inventoryElement.classList.remove('hidden'); // Exibe o inventário
    const choices = [
        { text: 'Voltar à Seleção de Região', action: 'showRegionSelection()' }
    ];
    showChoices(choices);
}

function showDialogueSequence(dialogues, finalChoices, initialContent = '') {
    let currentDialogue = 0;
    
    function showNextDialogue() {
        if (currentDialogue === 0 && initialContent) {
            // Mostra o conteúdo inicial primeiro (cenário/descrição)
            showStory(initialContent);
        }
        
        if (currentDialogue < dialogues.length) {
            // Adiciona o diálogo atual ao conteúdo existente
            const dialogueHtml = `
                <div class="dialogue ${dialogues[currentDialogue].type || ''} fade-in">
                    <strong>${dialogues[currentDialogue].speaker}:</strong> ${dialogues[currentDialogue].text}
                </div>
            `;
            showStory(dialogueHtml, false); // false = não limpa o conteúdo anterior
            
            currentDialogue++;
            
            // Mostra botão "Continuar" se ainda há diálogos
            if (currentDialogue < dialogues.length) {
                showChoices([
                    { text: 'Continuar...', action: 'showNextDialogue()' }
                ]);
                // Torna a função acessível globalmente
                window.showNextDialogue = showNextDialogue;
            } else {
                // Acabaram os diálogos, mostra as escolhas finais
                showChoices(finalChoices);
            }
        }
    }
    
    showNextDialogue();
}

function startRegion(region) {
    if (gameState.completedRegions.includes(region)) {
        showStory(`
            <div class="info fade-in">
                <h3>Região Já Concluída</h3>
                <p>Você já explorou a ${getRegionName(region)}. Escolha outro caminho.</p>
            </div>
        `);
        showChoices([
            { text: 'Voltar à Seleção de Região', action: 'showRegionSelection()' }
        ]);
        return;
    }

    gameState.currentPhase = getRegionName(region);
    updateUI();
    inventoryElement.classList.add('hidden'); // Esconde o inventário

    switch (region) {
        case 'floresta':
            startFlorestaAtendimentus();
            break;
        case 'cavernas':
            startCavernasFaturamentus();
            break;
        case 'vila':
            startVilaTransmissao();
            break;
        case 'torre':
            startTorreContas();
            break;
        default:
            showStory('<p>Região desconhecida.</p>');
            showChoices([{ text: 'Voltar', action: 'showRegionSelection()' }]);
    }
}

function getRegionName(region) {
    const names = {
        'floresta': 'Floresta do Atendimentus',
        'cavernas': 'Cavernas de Faturamentus',
        'vila': 'Vila da Transmissão',
        'torre': 'Torre de Contas a Receber'
    };
    return names[region] || 'Região Desconhecida';
}

function startFlorestaAtendimentus() {
    const initialContent = `
        <h3>Floresta do Atendimentus</h3>
        <p>Um lugar encantado onde pessoas doentes ou com almas feridas podem ir para serem curadas...</p>
        <br>
    `;
    
    const dialogues = [
        {
            speaker: 'Sandubinha',
            text: 'Então você é meu primeiro desafio nessa floresta encantada?'
        },
        {
            speaker: 'Processus Ministerii',
            text: 'Bem vindo, vejo que você é um dos escolhidos para enfraquecer Glozium. Sou o ser mágico que atende as almas feridas.',
            type: 'character'
        },
        {
            speaker: 'Processus',
            text: 'Você não irá lutar comigo, mas sim contra esse Monstrengo criado por Glozium!',
            type: 'character'
        },
        {
            speaker: 'Sandubinha',
            text: 'Primeiro, não é enfraquecer, vou dar um fim total em Glozium... Venha monstro!'
        }
    ];
    
    const finalChoices = [
        { text: 'Lutar contra o Monstrengo', action: "startBattle('monstrengo', 'floresta')" },
        { text: 'Voltar à Seleção de Região', action: 'showRegionSelection()' }
    ];
    
    showDialogueSequence(dialogues, finalChoices, initialContent);
}

function startCavernasFaturamentus() {
    const initialContent = `
        <h3>Cavernas de Faturamentus</h3>
        <p>Existe sempre um preço a se pagar pela cura do corpo e da alma...</p>
        <br>
        <p>Percorrendo a caverna segurando uma tocha, Sandubinha escuta sons assustadores de grunhidos. O cenário é iluminado por minérios misteriosos. Anciões fantasmas anotam coisas em pergaminhos.</p>
        <br>
    `;
    
    const dialogues = [
        {
            speaker: 'Sandubinha',
            text: 'Que tipo de situação é essa?'
        },
        {
            speaker: 'Urso Sangrento',
            text: 'Finalmente diversão! Esses anciões só sabem ficar anotando essas coisas inúteis. Vamos lutar heroizinho!',
            type: 'character'
        },
        {
            speaker: 'Sandubinha',
            text: 'Criatura desagradável, não me deu tempo nem de tomar uma água, então bora nessa!'
        }
    ];
    
    const finalChoices = [
        { text: 'Lutar contra o Urso Sangrento', action: "startBattle('urso_sangrento', 'cavernas')" },
        { text: 'Voltar à Seleção de Região', action: 'showRegionSelection()' }
    ];
    
    showDialogueSequence(dialogues, finalChoices, initialContent);
}

function startVilaTransmissao() {
    const initialContent = `
        <h3>Vila da Transmissão</h3>
        <p>Uma vila mágica que recebe cobranças vindas das cavernas de Faturamentus...</p>
        <br>
        <p>Sandubinha é bem recebido em sua chegada. Ele é convidado para um jantar ritualístico com comidas típicas.</p>
        <br>
    `;
    
    const dialogues = [
        {
            speaker: 'Moradores',
            text: 'O monstro que enfrentará voa! Use este Estilingue Mágico para derrubá-lo antes de atacar!',
            type: 'character'
        }
    ];
    
    // Adicionar estilingue ao inventário
    if (!gameState.items.includes('estilingue_magico')) {
        gameState.items.push('estilingue_magico');
        updateUI();
        
        // Adiciona o diálogo do item recebido
        dialogues.push({
            speaker: 'Sistema',
            text: 'Você adquiriu o Estilingue Mágico!',
            type: 'item-pickup'
        });
    }
    
    const finalChoices = [
        { text: 'Lutar contra o Dragão', action: "startBattle('dragao_transmissao', 'vila')" },
        { text: 'Voltar à Seleção de Região', action: 'showRegionSelection()' }
    ];
    
    showDialogueSequence(dialogues, finalChoices, initialContent);
}

function startTorreContas() {
    showStory(`
        <h3>Torre de Contas a Receber</h3>
        <p>A terrível torre onde seres mágicos recebem pagamento por seu árduo trabalho...</p>
        <br>
        <p>Sandubinha chega à base da torre. Ele sente uma energia mágica mortífera vindo do topo. Sem dúvidas, Glozium estava lá...</p>
        <br>
        <p>Como você deseja subir?</p>
    `);

    const choices = [];

    // Opção de Escalar (sempre disponível)
    choices.push({
        text: 'Escalar a torre (-3 de vida)',
        action: 'approachTorreContas("escalar")'
    });

    // Opção de Voar com Azah Transmissão (se tiver e estiver equipada)
    if (gameState.items.includes('azah_transmissao')) {
        choices.push({
            text: 'Voar com Azah Transmissão (se equipada)', // Texto mais indicativo
            action: 'approachTorreContas("voar")'
        });
    }

    choices.push({
        text: 'Voltar à Seleção de Região',
        action: 'showRegionSelection()'
    });

    showChoices(choices);
}
// Gerencia a abordagem à Torre de Contas
function approachTorreContas(method) {
    if (method === 'escalar') {
        gameState.playerLife = Math.max(0, gameState.playerLife - 3); // Reduz vida, não permitindo ir abaixo de 0
        updateUI();
        if (gameState.playerLife <= 0) {
            gameOver("Você caiu e foi derrotado ao tentar escalar a Torre de Contas...");
            return;
        }
        showStory(`
            <div class="info fade-in">
                <p>Você escalou a torre, mas perdeu 3 de vida no processo.</p>
            </div>
        `, false);
        showChoices([
            { text: 'Continuar', action: "startBattle('estatua_heroi', 'torre')" }
        ]);
    } else if (method === 'voar') {
        // Verifica se Azah Transmissão está equipada
        if (gameState.equippedItems.includes('azah_transmissao')) {
            showStory(`
                <div class="info fade-in">
                    <p>Você usou a Azah Transmissão para voar até o topo da torre, evitando danos!</p>
                </div>
            `, false);
            showChoices([
                { text: 'Continuar', action: "startBattle('estatua_heroi', 'torre')" }
            ]);
        } else {
            showStory(`
                <div class="warning fade-in">
                    <p>Você não tem a Azah Transmissão equipada para voar!</p>
                </div>
            `, false);
            showChoices([
                { text: 'Voltar', action: 'startTorreContas()' }
            ]);
        }
    }
}

function fightGlozium() {
    if (!gameState.hasZGSword) {
        showStory(`
            <div class="game-over">
                <h3>Desafio Perigoso!</h3>
                <p>Enfrentar Glozium sem a Espada ZG é extremamente arriscado!</p>
                <p>Você tem certeza que quer continuar?</p>
            </div>
        `);
        showChoices([
            { text: 'Sim, enfrentar mesmo assim!', action: "startBattle('glozium', 'final')" },
            { text: 'Voltar ao Menu Principal', action: 'showMainMenu()' }
        ]);
    } else {
        showStory(`
            <div class="victory">
                <h3>Batalha Final!</h3>
                <p>Com a Espada ZG em mãos, você está pronto para enfrentar Glozium!</p>
                <p>O destino de Hospitalis está em suas mãos!</p>
            </div>
        `);
        showChoices([
            { text: 'Enfrentar Glozium!', action: "startBattle('glozium', 'final')" },
            { text: 'Voltar ao Menu Principal', action: 'showMainMenu()' }
        ]);
    }
}

function forgeZGSword() {
    const requiredItems = [
        'guia_atendimento',
        'faturamentus',
        'azah_transmissao',
        'colar_estatua'
    ];

    // Check if has all items
    if (!requiredItems.every(item => gameState.items.includes(item))) {
        showStory(`
            <div class="error fade-in">
                <h3>Itens Insuficientes</h3>
                <p>Você precisa dos 4 artefatos sagrados para forjar a Espada ZG!</p>
            </div>
        `);
        showChoices([
            { text: 'Voltar ao Menu Principal', action: 'showMainMenu()' }
        ]);
        return;
    }

    // Remove old items
    requiredItems.forEach(item => {
        const index = gameState.items.indexOf(item);
        if (index > -1) {
            gameState.items.splice(index, 1);
        }
    });

    // Add ZG Sword
    gameState.items.push('espada_zg');
    gameState.hasZGSword = true;
    gameState.equippedItems = ['espada_zg']; // Equipa a espada ZG automaticamente

    // Show forge animation
    showStory(`
        <div class="victory fade-in">
            <h3>A Espada ZG foi Forjada!</h3>
            <p>Os 4 artefatos se uniram em uma arma lendária.</p>
            <p>Agora você está pronto para enfrentar Glozium!</p>
        </div>
    `);

    showChoices([
        { text: 'Voltar ao Menu Principal', action: 'showMainMenu()' }
    ]);

    updateUI();
}

function startBattle(enemyId, region) {
    const enemy = enemies[enemyId];
    gameState.battleState = {
        enemy: enemy,
        enemyLife: enemy.life,
        enemyMaxLife: enemy.life, // Garante que a vida máxima do inimigo seja armazenada
        // Números secretos são definidos APENAS aqui no início da batalha e sao fixos ate o final.
        playerSecret: Math.floor(Math.random() * gameState.maxLife) + 1, // Numero secreto do jogador baseado na Vida Maxima.
        enemySecret: Math.floor(Math.random() * enemy.life) + 1, // Numero secreto do Inimigo baseado na Vida Maxima do inimigo.
        region: region,
        round: 1,
        battleLog: [],
        itemUsageCount: {}, // Para rastrear o uso de itens (se necessário)
        extraEnemyDamage: 0, // Para a consequência do Faturamentus
        playerDamageFromConsequence: 0, // Para a consequência do Azah Transmissão
        enemyStunned: false, // Para o Estilingue Mágico
        estilingueMissCount: 0, // Para a consequência de erros do Estilingue Mágico
        lastRolledNumber: 0 // Para a consequência do Azah Transmissão
    };

    // Log inicial dos números secretos
    gameState.battleState.battleLog.push(`<span style="color: #9c27b0;">Números secretos - Jogador: ${gameState.battleState.playerSecret}, Inimigo: ${gameState.battleState.enemySecret}</span>`);

    showBattleInterface();
}
// Função showBattleInterface modificada com health bars
function showBattleInterface() {
    const battle = gameState.battleState;
    if (!battle) {
        showStory('<p>Erro: Nenhuma batalha ativa. Retornando ao menu principal.</p>');
        showMainMenu();
        return;
    }

    // Exibição de múltiplos itens equipados
    let equippedItemsHtml = '';
    if (gameState.equippedItems.length > 0) {
        equippedItemsHtml = '<p>Itens Equipados: ';
        equippedItemsHtml += gameState.equippedItems.map(itemId => items[itemId].name).join(', ');
        equippedItemsHtml += '</p>';
    }


    const storyContent = `
        <div class="battle-area fade-in">
            <h3>BATALHA ÉPICA</h3>
            
            <div class="battle-stats">
                <div class="battle-enemy-group">
                    <div class="battle-enemy-avatar-container">
                        <img src="${battle.enemy.image}" alt="Avatar ${battle.enemy.name}" class="battle-avatar">
                    </div>
                    <div class="enemy-stat">
                        <h4>${battle.enemy.name}</h4>
                        <div class="battle-health-bar-info">
                            <div class="battle-health-bar">
                                <div class="battle-health-fill" id="enemyHealthFill"></div>
                            </div>
                            <span class="battle-health-text" id="enemyHealthText">${battle.enemyLife}/${battle.enemyMaxLife}</span>
                            ${battle.enemyStunned ? '<span class="stunned-text">Atordoado!</span>' : ''}
                        </div>
                        <p>Número Secreto: ${battle.enemySecret}</p>
                    </div>
                </div>

                <div class="battle-player-group">
                    <div class="battle-player-avatar-container">
                        <img src="/src/assets/images/sandubatalha.png" alt="Avatar Sandubinha Batalha" class="battle-avatar">
                    </div>
                    <div class="character-stat">
                        <h4>Sandubinha</h4>
                        <div class="battle-health-bar-info">
                            <div class="battle-health-bar">
                                <div class="battle-health-fill" id="heroHealthFill"></div>
                            </div>
                            <span class="battle-health-text" id="heroHealthText">${gameState.playerLife}/${gameState.maxLife}</span>
                        </div>
                        <p>Número Secreto: ${battle.playerSecret}</p>
                        ${equippedItemsHtml}
                    </div>
                </div>
            </div>
            
            <div class="battle-log" id="battleLog">
                ${battle.battleLog.join('<br>')}
            </div>
        </div>
    `;

    showStory(storyContent, true);
    inventoryElement.classList.add('hidden');

    // Atualizar as health bars após renderizar
    setTimeout(() => {
        updateBattleHealthBars();
    }, 50);

    const choices = [
        { text: 'Atacar!', action: 'playerAttack()' },
        { text: 'Gerenciar Itens', action: 'showBattleItemManagement()' },
        { text: 'Fugir da Batalha', action: 'fleeBattle()' }
    ];
    showChoices(choices);
}

function playerAttack() {
    const battle = gameState.battleState;
    let diceCount = 1; // Dados base
    let totalDamageMultiplier = 1; // Para Espada ZG se ela tiver multiplicador de dano

    // Resetar consequências de itens para o turno atual
    // As flags de dano extra/consequência são reiniciadas a cada ataque
    battle.extraEnemyDamage = 0;
    battle.playerDamageFromConsequence = 0;
    battle.lastRolledNumber = 0;

    // Flags para controlar efeitos complexos de itens
    let hasEstilingue = false;
    let hasFaturamentus = false;
    let hasAzah = false;
    let hasColar = false;
    let hasEspadaZG = false;

    const isDragonBattle = battle.enemy.name === 'Dragão da Transmissão';
    const isEstilingueEquipped = gameState.equippedItems.includes('estilingue_magico');
    const isZGSwordEquipped = gameState.equippedItems.includes('espada_zg');

    // --- LÓGICA PARA BATALHA DO DRAGÃO ---
    // Se for a batalha do Dragão:
    // O jogador SÓ PODE atacar se o Estilingue Mágico estiver equipado
    // A ideia é o dragao tá voando e só é acertado com o estilingue mágico. Se acerta, ele cai e o jogador pode atacar. Só entao começa logica de dano.
    // E a Espada ZG NÃO estiver equipada.
    // Outros itens (buffs) são permitidos porque nao sao armas, mas sim itens de suporte.
    if (isDragonBattle) {
        if (!isEstilingueEquipped || isZGSwordEquipped) { // AQUI ESTÁ A MUDANÇA PRINCIPAL
            let errorMessage = '';
            if (!isEstilingueEquipped) {
                errorMessage = 'O Dragão da Transmissão está no ar! Você precisa equipar o Estilingue Mágico para atacá-lo.';
            } else if (isZGSwordEquipped) {
                errorMessage = 'O Dragão da Transmissão está no ar! Você não pode atacá-lo com a Espada ZG. Desequipe-a para usar o Estilingue.';
            }
            battle.battleLog.push(`<span style="color: #f44336;">${errorMessage}</span>`);
            showBattleInterface();
            return;
        }
    }
    // --- FIM DA LÓGICA PARA BATALHA DO DRAGÃO ---


    // Aplicar benefícios de TODOS os itens equipados
    if (gameState.equippedItems.length > 0) {
        gameState.equippedItems.forEach(itemId => {
            switch(itemId) {
                case 'guia_atendimento':
                    diceCount += 1; // Soma +1 aos dados base, totalizando 2
                    break;
                case 'faturamentus':
                    diceCount += 3; // Soma +3 aos dados base, totalizando 4
                    hasFaturamentus = true;
                    break;
                case 'estilingue_magico':
                    hasEstilingue = true; // Lógica do Estilingue será tratada separadamente
                    diceCount += Math.floor(battle.enemyMaxLife / 2); // Sorteia metade da vida máxima do inimigo como tentativas
                    break;
                case 'azah_transmissao':
                    diceCount += 10;
                    hasAzah = true;
                    break;
                case 'colar_estatua':
                    diceCount += 10;
                    hasColar = true; // Consequência aplicada antes da rolagem
                    break;
                case 'espada_zg':
                    diceCount += 39; // Soma +39 aos dados base, totalizando 40
                    hasEspadaZG = true;
                    totalDamageMultiplier = 2; // Exemplo: Espada ZG dobra o dano. Ajuste se quiser outro valor.
                    break;
            }
        });

        // Aplica consequências de itens que afetam o jogador ANTES da rolagem (ex: Colar)
        if (hasColar) {
            gameState.playerLife -= 3;
            battle.battleLog.push(`<span style="color: #f44336;">Você perdeu 3 de vida ao usar o Colar da Estátua Sagrada!</span>`);
            if (gameState.playerLife <= 0) {
                gameOver("Você morreu ao usar o Colar da Estátua Sagrada...");
                return;
            }
        }

        // Lógica do Estilingue Mágico (50% de chance de falha/sucesso)
        if (hasEstilingue) {
            if (Math.random() < 0.5) { // 50% de chance de falhar o tiro do estilingue
                battle.battleLog.push(`<span style="color: #ff9800;">O Estilingue Mágico falhou em acertar o alvo!</span>`);
                battle.estilingueMissCount++;
                if (battle.estilingueMissCount >= 3) {
                    gameState.playerLife -= 1;
                    battle.battleLog.push(`<span style="color: #f44336;">O Estilingue Mágico causou -1 de vida devido a erros consecutivos!</span>`);
                    battle.estilingueMissCount = 0;
                    if (gameState.playerLife <= 0) {
                        gameOver("Você foi derrotado pelo seu próprio Estilingue Mágico...");
                        return;
                    }
                }
                setTimeout(() => enemyAttack(), 1500);
                return;
            }
            battle.estilingueMissCount = 0; // Se o estilingue ACERTOU, reseta o contador de erros.

            // Se o estilingue acertou E o inimigo NÃO ESTÁ atordoado, então atordoa.
            if (!battle.enemyStunned) {
                battle.enemyStunned = true;
                battle.battleLog.push(`<span style="color: #00bcd4;">O ${battle.enemy.name} está atordoado e perde o próximo turno!</span>`);
            }
        }
    }

    // Sortear números baseado na vida MÁXIMA do inimigo
    const rolledNumbers = [];
    for (let i = 0; i < diceCount; i++) {
        rolledNumbers.push(Math.floor(Math.random() * battle.enemyMaxLife) + 1);
    }

    // Armazenar o último número sorteado, independentemente de ter acertado ou não
    if (rolledNumbers.length > 0) {
        battle.lastRolledNumber = rolledNumbers[rolledNumbers.length - 1];
    }

    // Contar acertos no número secreto
    const hits = rolledNumbers.filter(n => n === battle.enemySecret).length;
    let damage = hits * battle.enemySecret;

    // Aplicar multiplicador de dano da Espada ZG, se equipada
    if (hasEspadaZG) {
        damage *= totalDamageMultiplier;
        battle.battleLog.push(`<span style="color: #00bcd4;">Espada ZG multiplica o dano! Dano total: ${damage}</span>`);
    }

    battle.battleLog.push(`<strong>⚔️ Sandubinha ataca!</strong> Números: [${rolledNumbers.join(', ')}] (Intervalo: 1-${battle.enemyMaxLife})`);

    if (hits > 0) {
        battle.enemyLife -= damage;
        if (battle.enemyLife < 0) battle.enemyLife = 0;
        battle.battleLog.push(`<span style="color: #4CAF50;">Acertou! ${hits} acerto(s) do ${battle.enemySecret} = ${damage} de dano!</span>`);

        if (battle.enemyLife === 0) {
            playerWinsBattle();
            return;
        }
    } else {
        battle.battleLog.push(`<span style="color: #ff9800;">Errou o ataque!</span>`);

        // Aplicar consequências de itens que afetam o inimigo ou jogador após falha
        if (hasFaturamentus) {
            battle.extraEnemyDamage = 2;
            battle.battleLog.push(`<span style="color: #ffeb3b;">⚠️ Consequência do Faturamentus: Próximo ataque inimigo +2 dano!</span>`);
        }
        if (hasAzah) {
            battle.playerDamageFromConsequence = battle.lastRolledNumber;
            battle.battleLog.push(`<span style="color: #ffeb3b;">⚠️ Consequência do Azah Transmissão: Próximo dano será ${battle.playerDamageFromConsequence}!</span>`);
        }
    }

    if (battle.enemyLife > 0) {
        setTimeout(() => enemyAttack(), 1500);
    }
}

function enemyAttack() {
    const battle = gameState.battleState;

    // Se o inimigo estiver atordoado, ele perde o turno
    if (battle.enemyStunned) {
        battle.battleLog.push(`${battle.enemy.name} está atordoado e não consegue atacar!`);
        battle.enemyStunned = false; // Reseta o estado de atordoamento
        showBattleInterface();
        return; // Sai da função, inimigo não ataca
    }

    const diceCount = battle.enemy.diceCount;
    const rolledNumbers = [];

    // Sortear números baseado na vida MÁXIMA do jogador
    for (let i = 0; i < diceCount; i++) {
        rolledNumbers.push(Math.floor(Math.random() * gameState.maxLife) + 1);
    }

    const hits = rolledNumbers.filter(n => n === battle.playerSecret).length;
    let damage = hits * battle.playerSecret;

    // Aplicar dano extra do Faturamentus se foi ativado no turno anterior do jogador
    if (battle.extraEnemyDamage > 0) {
        damage += battle.extraEnemyDamage;
        battle.battleLog.push(`<span style="color: #ffeb3b;">Dano extra de ${battle.extraEnemyDamage} do Faturamentus!</span>`);
        battle.extraEnemyDamage = 0; // Reseta após uso
    }

    // Aplicar dano da consequência do Azah Transmissão se foi ativado no turno anterior do jogador
    if (battle.playerDamageFromConsequence > 0) {
        damage = battle.playerDamageFromConsequence; // O dano é igual ao último número sorteado
        battle.battleLog.push(`<span style="color: #ffeb3b;">Dano de ${battle.playerDamageFromConsequence} da consequência do Azah Transmissão!</span>`);
        battle.playerDamageFromConsequence = 0; // Reseta após uso
    }

    battle.battleLog.push(`<strong>${battle.enemy.name} ataca!</strong> Números: [${rolledNumbers.join(', ')}] (Intervalo: 1-${gameState.maxLife})`);

    if (hits > 0) {
        gameState.playerLife -= damage;
        if (gameState.playerLife < 0) gameState.playerLife = 0; // Garante que a vida não fique negativa
        battle.battleLog.push(`<span style="color: #f44336;">Você levou ${damage} de dano! (${hits} acerto(s) do ${battle.playerSecret})</span>`);

        if (gameState.playerLife === 0) {
            gameOver("Você foi derrotado em batalha...");
            return;
        }
    } else {
        battle.battleLog.push(`<span style="color: #4CAF50;">O inimigo errou o ataque!</span>`);
    }

    // No final do turno do inimigo, se a batalha ainda estiver ativa, atualiza a interface
    if (gameState.playerLife > 0 && battle.enemyLife > 0) {
        showBattleInterface();
    }
}

function showBattleItemManagement() {
    const battle = gameState.battleState;
    let itemChoices = gameState.items.map(itemId => {
        const item = items[itemId];
        const equipped = gameState.equippedItems.includes(itemId) ? '(Equipado)' : '';
        return {
            text: `${item.name} ${equipped} - Benefício: ${item.benefit} - Consequência: ${item.consequence}`,
            action: `toggleEquip('${itemId}'); showBattleItemManagement();` // Permite equipar/desequipar e permanecer na tela de gerenciamento
        };
    });

    itemChoices.push({
        text: 'Voltar para a Batalha',
        action: 'showBattleInterface()'
    });

    showStory(`
        <h3>Selecione um Item para Equipar/Desequipar</h3>
        <p>Clique nos itens para equipar ou desequipar. Você pode equipar múltiplos itens.</p>
    `);
    showChoices(itemChoices);
    inventoryElement.classList.remove('hidden'); // Exibe o inventário
}

function resetGame() {
    startGame();
}

function gameOver(message) {
    gameState.battleState = null; // Limpa o estado da batalha
    updateUI();
    showStory(`
        <div class="game-over fade-in">
            <h3>GAME OVER!</h3>
            <p>${message}</p>
            <p>O mundo foi destruído por Glozium, uma fatalidade terrível... Fim de jogo!</p>
        </div>
    `);
    showChoices([
        { text: 'Jogar Novamente', action: 'resetGame()' }
    ]);
}

function victory(message) {
    showStory(`
        <div class="victory">
            <h3>Vitória!</h3>
            <p>${message}</p>
        </div>
    `);
    showChoices([
        { text: 'Continuar', action: 'showMainMenu()' }
    ]);
}

function fleeBattle() {
    const battle = gameState.battleState;
    if (battle && battle.region === 'glozium' && !gameState.hasZGSword) {
        showStory(`
            <div class="info fade-in">
                <h3>Não pode fugir de Glozium sem a Espada ZG!</h3>
                <p>A força de Glozium é avassaladora. Você tenta fugir, mas é rapidamente encurralado...</p>
            </div>
        `);
        // O jogador não pode fugir de Glozium sem a Espada ZG, então é um Game Over.
        setTimeout(() => gameOver("Você tentou fugir de Glozium sem a Espada ZG e foi aniquilado."), 2000);
        return;
    }

    showStory(`
        <div class="info fade-in">
            <h3>Você fugiu da batalha!</h3>
            <p>A vida é uma escolha, e hoje você escolheu viver. Mas a ameaça de Glozium ainda persiste.</p>
        </div>
    `);
    gameState.battleState = null; // Limpa o estado da batalha
    updateUI();
    showChoices([
        { text: 'Voltar à Seleção de Região', action: 'showRegionSelection()' },
    ]);
}

function playerWinsBattle() {
    const battle = gameState.battleState;
    battle.battleLog.push(`<span class="victory">Você venceu a batalha contra ${battle.enemy.name}!</span>`);

    // Lógica para Glozium (Vitória Final)
     if (battle.enemy.name === 'Glozium') {
        endGameVictory(); // Nova função para a vitória final
        return; // Sai da função para não aplicar as regras de vitória normal
        }

    gameState.maxLife += 2; // Ganha +2 de vida máxima por vitória
    gameState.playerLife = gameState.maxLife; // Aumenta a vida máxima também - Cura total.
    battle.battleLog.push(`<span class="victory">Sua vida máxima aumentou para ${gameState.maxLife}!</span>`);

    let itemAcquired = null;
    let nextAction = 'showRegionSelection()'; // Default action

    switch (battle.region) {
        case 'floresta':
            itemAcquired = 'guia_atendimento';
            break;
        case 'cavernas':
            itemAcquired = 'faturamentus';
            break;
        case 'vila':
            itemAcquired = 'azah_transmissao'; // Corrigido para Azah Transmissão
            break;
        case 'torre':
            itemAcquired = 'colar_estatua';
            break;
    }

    if (itemAcquired && !gameState.items.includes(itemAcquired)) {
        gameState.items.push(itemAcquired);
        battle.battleLog.push(`<span class="item-pickup">Você adquiriu o <strong>${items[itemAcquired].name}</strong>!</span>`);
    }

    // Marca a região como completa
    if (!gameState.completedRegions.includes(battle.region)) {
        gameState.completedRegions.push(battle.region);
    }

    gameState.battleState = null; // Limpa o estado da batalha
    updateUI();

    showStory(`
        <div class="fade-in">
            ${battle.battleLog.join('<br>')}
        </div>
    `, true); // Limpa e exibe o log final
    showChoices([
        { text: 'Continuar Jornada', action: nextAction }
    ]);
}

function endGameVictory() {
    gameState.currentPhase = 'Vitória Final';
    updateUI(); // Atualiza a UI para mostrar a fase de vitória
    showStory(`
        <div class="game-over victory-screen fade-in">
            <h3>🎉 VITÓRIA! 🎉</h3>
            <h4>O LEGADO DE SANDUBINHA!</h4>
            <p>Com a Espada ZG em mãos e o coração de um verdadeiro herói, Sandubinha derrotou o temível Glozium!</p>
            <p>O reino de Hospitalis está livre de sua opressão. A paz finalmente retorna às terras.</p>
            <p>Seu nome será lembrado através das eras como o grande salvador!</p>
            <br>
            <p>Obrigado por jogar!</p>
        </div>
    `);
    showChoices([
        { text: 'Jogar Novamente', action: 'resetGame()' },
        { text: 'Ver Créditos (Opcional)', action: 'showCredits()' } // Exemplo: Adicionar uma tela de créditos
    ]);
}

function getItemNameByRegion(region) {
    const itemNames = {
        'floresta': 'Guia de Atendimento',
        'cavernas': 'Faturamentus',
        'vila': 'Azah Transmissão',
        'torre': 'Colar da Estátua Sagrada'
    };
    return itemNames[region] || 'Item Desconhecido';
}

// Inicializa o jogo quando a página carrega
window.onload = startGame;


