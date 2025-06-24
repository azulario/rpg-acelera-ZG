# RPG Interativo Sandubinha

Projeto desenvolvido para processo seletivo - ZG Soluções

🎮 **Sobre o Projeto**

Jogo de RPG interativo desenvolvido em JavaScript vanilla, HTML5 e CSS3, seguindo as especificações técnicas fornecidas. Implementa um sistema de batalha único baseado em números secretos, exploração de regiões e uma narrativa interativa que guia o jogador na jornada de Sandubinha para derrotar o temível Glozium.

---

🧩 **Funcionalidades Implementadas**

### Sistema de Batalha
* Mecânica de números secretos: Um número secreto é definido no início de cada batalha para o jogador e para o inimigo, baseado na vida máxima atual de cada um. Os ataques consistem em sortear números e verificar se eles correspondem ao número secreto do oponente.
* Turnos alternados entre jogador e inimigos.
* Log de batalha em tempo real, registrando os eventos da rodada.
* Opção de fuga (desistir da missão) e gerenciamento de itens durante o combate.

### Sistema do Personagem
* Vida inicial: 5 HP.
* Evolução: +2 HP máximo por vitória em batalha, com cura completa.
* Cura completa após cada batalha vencida.

### Inventário e Itens
* 6 itens únicos com efeitos específicos que influenciam as batalhas:
    * **Guia de Atendimento**: Sorteia +1 número adicional por ataque (totalizando 2).
    * **Faturamentus**: Sorteia +3 números adicionais por ataque (totalizando 4). Se o ataque errar o número secreto do monstro, o próximo ataque inimigo causa +2 de dano.
    * **Estilingue Mágico**: 50% de chance de atordoar o inimigo. Sorteia metade da vida máxima do inimigo como tentativas. Pode errar 3 vezes por batalha sem penalidade; após isso, cada uso adicional causa -1 de vida ao personagem.
    * **Azah Transmissão**: Permite voar até a Torre de Contas a Receber sem perder vida (se equipado). Sorteia +10 números adicionais por rodada. Se o ataque errar, o próximo dano recebido é igual ao último número sorteado pelo jogador.
    * **Colar da Estátua Sagrada**: Sorteia +10 números adicionais por ataque. Cada uso reduz 3 de vida do personagem.
    * **Espada ZG**: A lendária espada forjada a partir dos quatro artefatos sagrados. Sorteia 40 números por ataque e seu dano é multiplicado. É a chave para derrotar Glozium definitivamente.
* Permite equipar múltiplos itens simultaneamente, somando seus benefícios.

### Regiões e Exploração
* 4 regiões distintas para explorar: Floresta do Atendimentus, Cavernas de Faturamentus, Vila da Transmissão e Torre de Contas a Receber.
* Narrativa específica para cada região, com diálogos sequenciais que avançam com o clique do jogador.
* Sistema de progressão que permite ao jogador escolher livremente a próxima região a ser explorada.
* Mecânica especial na Torre de Contas a Receber, onde o jogador pode perder vida ao escalar se não tiver o item Azah Transmissão equipado.

### Recursos Adicionais
* Sistema de forja da Espada ZG: Requer a coleta dos quatro artefatos sagrados (Guia de Atendimento, Faturamentus, Azah Transmissão, Colar da Estátua Sagrada).
* Finais alternativos para a batalha contra Glozium (vitória definitiva com a Espada ZG vs. derrota parcial ou transformação em estátua sem ela).
* Diálogos sequenciais com botão "Continuar" para controle do ritmo da leitura.
* Interface responsiva com animações visuais de dano e ataque.

---

🛠️ **Tecnologias**

* **HTML5**: Estrutura e semântica do jogo.
* **CSS3**: Estilização e animações visuais, incluindo responsividade para diferentes telas.
* **JavaScript ES6**: Lógica principal do jogo, gerenciamento de estado e interações.

---

📊 **Destaques Técnicos**

* **Números Secretos Fixos**: Gerados uma vez por batalha e baseados na vida máxima atual do personagem/inimigo, adicionando uma camada estratégica ao combate.
* **Gerenciamento de Estados de Batalha**: Controla turnos, efeitos de atordoamento e outras condições temporárias de combate.
* **Sistema de Efeitos de Itens**: Cada item possui mecânicas e consequências únicas que alteram o fluxo da batalha de forma dinâmica.
* **Narrativa Dinâmica**: Múltiplos desfechos baseados nas escolhas e desempenho do jogador, incentivando a rejogabilidade.

---

🏆 **Status**

* **Funcionalidades Core**: 100% implementadas de acordo com a mecânica preferida.
* **Especificação**: 95% atendida (pendente apenas a implementação de um item de cura, acredito que a lógica de cura total após a vitória soluciona essa lacuna).
* **Estado**: Funcional e jogável.

---

Desenvolvido por Nathalia Veiga - Candidata à vaga de estágio ZG Soluções
