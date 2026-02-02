import { Card } from '../core/card.js';
import { GameState } from '../core/game_state.js';
import { ExactEngine } from '../engines/exact_engine.js';
import { MonteCarloEngine } from '../engines/monte_carlo_engine.js';

class App {
    constructor() {
        this.gameState = new GameState();
        this.selectedSlot = null;
        this.cardsMap = new Map(); // slotIndex -> Card
        
        this.init();
    }

    init() {
        this.cacheDOM();
        this.bindEvents();
        this.renderCardPicker();
    }

    cacheDOM() {
        this.slots = document.querySelectorAll('.card-slot');
        this.modal = document.getElementById('card-picker-modal');
        this.closeModalBtn = document.getElementById('btn-close-modal');
        this.suitsContainer = document.querySelector('.suits-container');
        this.btnCalc = document.getElementById('btn-calc');
        this.btnReset = document.getElementById('btn-reset');
        this.resultsContainer = document.getElementById('results');
        
        this.elProbPlayer = document.getElementById('prob-player');
        this.elProbCpu = document.getElementById('prob-cpu');
        this.elProbTie = document.getElementById('prob-tie');
        this.elTime = document.getElementById('stats-time');
        this.elScenarios = document.getElementById('stats-scenarios');
    }

    bindEvents() {
        this.slots.forEach(slot => {
            slot.addEventListener('click', () => this.openCardPicker(slot));
        });

        this.closeModalBtn.addEventListener('click', () => this.modal.classList.add('hidden'));
        
        this.btnReset.addEventListener('click', () => this.reset());
        this.btnCalc.addEventListener('click', () => this.calculate());
        
        // Close modal on outside click
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) this.modal.classList.add('hidden');
        });
    }

    renderCardPicker() {
        this.suitsContainer.innerHTML = '';
        const suits = ['c', 'd', 'h', 's'];
        const suitSymbols = {'c': '♣', 'd': '♦', 'h': '♥', 's': '♠'};
        const ranks = ['2', '3', '4', '5', '6', '7', '8', '9', 'T', 'J', 'Q', 'K', 'A'];

        suits.forEach(suit => {
            const row = document.createElement('div');
            row.className = 'suit-row';
            
            ranks.forEach(rank => {
                const btn = document.createElement('div');
                btn.className = `card-pick ${suit === 'h' || suit === 'd' ? 'red' : 'black'}`;
                btn.textContent = `${rank}${suitSymbols[suit]}`;
                btn.dataset.rank = rank;
                btn.dataset.suit = suit;
                
                btn.addEventListener('click', () => this.handleCardPick(rank, suit));
                row.appendChild(btn);
            });
            this.suitsContainer.appendChild(row);
        });
    }

    openCardPicker(slot) {
        this.selectedSlot = slot;
        this.updatePickerAvailability();
        this.modal.classList.remove('hidden');
    }

    updatePickerAvailability() {
        const pickedCards = Array.from(this.cardsMap.values());
        const buttons = this.suitsContainer.querySelectorAll('.card-pick');
        
        buttons.forEach(btn => {
            const r = btn.dataset.rank;
            const s = btn.dataset.suit;
            const isPicked = pickedCards.some(c => c.rank === r && c.suit === s);
            
            const slotIndex = this.getSlotKey(this.selectedSlot);
            const currentCard = this.cardsMap.get(slotIndex);
            const isCurrent = currentCard && currentCard.rank === r && currentCard.suit === s;
            
            if (isPicked && !isCurrent) {
                btn.classList.add('disabled');
            } else {
                btn.classList.remove('disabled');
            }
        });
    }

    handleCardPick(rank, suit) {
        const card = new Card(rank, suit);
        const key = this.getSlotKey(this.selectedSlot);
        this.cardsMap.set(key, card);
        
        this.renderSlot(this.selectedSlot, card);
        this.modal.classList.add('hidden');
    }

    getSlotKey(slot) {
        return `${slot.dataset.type}-${slot.dataset.index}`;
    }

    renderSlot(slot, card) {
        slot.classList.add('filled');
        const isRed = card.suit === 'h' || card.suit === 'd';
        slot.classList.remove('red', 'black');
        slot.classList.add(isRed ? 'red' : 'black');
        
        const suitSymbols = {'c': '♣', 'd': '♦', 'h': '♥', 's': '♠'};
        slot.textContent = `${card.rank}${suitSymbols[card.suit]}`;
    }

    reset() {
        this.cardsMap.clear();
        this.slots.forEach(slot => {
            slot.textContent = '';
            slot.classList.remove('filled', 'red', 'black');
        });
        this.resultsContainer.classList.add('hidden');
        this.gameState.reset();
    }

    async calculate() {
        // Build GameState
        const playerHand = [];
        const communityCards = [];
        
        // Iterate slots to build state
        for (let i = 0; i < 2; i++) {
            const card = this.cardsMap.get(`player-${i}`);
            if (card) playerHand.push(card);
        }

        for (let i = 0; i < 5; i++) {
            const card = this.cardsMap.get(`community-${i}`);
            if (card) communityCards.push(card);
        }

        if (playerHand.length !== 2) {
            alert("Please select 2 player cards.");
            return;
        }

        if (communityCards.length < 3 && communityCards.length > 0) {
            alert("Please select at least 3 community cards (Flop) or none (Pre-flop - Not supported in Exact).");
            return;
        }
        
        if (communityCards.length === 0) {

        }

        this.gameState.reset();
        this.gameState.setPlayerHand(playerHand[0], playerHand[1]);
        this.gameState.setCommunityCards(communityCards);

        const mode = document.querySelector('input[name="mode"]:checked').value;
        
        this.btnCalc.disabled = true;
        this.btnCalc.textContent = "Calculating...";
        
        // Small delay to allow UI render
        setTimeout(() => {
            try {
                let engine;
                let results;
                const start = performance.now();

                console.log("Mode: ", mode);

                if (mode === 'exact') {
                    if (communityCards.length < 3) {
                         alert("Exact calculation requires at least the Flop (3 cards).");
                         throw new Error("Invalid state for Exact");
                    }
                    engine = new ExactEngine();
                    results = engine.calculate(this.gameState);
                } else {
                    const simInput = document.getElementById('mc-simulations');
                    let simulations = parseInt(simInput.value, 10) || 10000;

                    console.log("Simulations: ", simulations);
                    
                    // Clamping
                    if (simulations < 100) simulations = 100;
                    if (simulations > 1000000) simulations = 1000000;
                    simInput.value = simulations; // Reflect clamped value
                    
                    engine = new MonteCarloEngine(simulations);
                    results = engine.calculate(this.gameState);
                }
                
                const end = performance.now();
                this.displayResults(results, end - start, mode);
            } catch (e) {
                console.error(e);
                if (e.message !== "Invalid state for Exact") alert("Error: " + e.message);
            } finally {
                this.btnCalc.disabled = false;
                this.btnCalc.textContent = "Calculate Probabilities";
            }
        }, 50);
    }

    displayResults(results, timeMs, mode) {
        this.resultsContainer.classList.remove('hidden');
        
        const format = (n) => (n * 100).toFixed(2) + '%';
        
        this.elProbPlayer.textContent = format(results.playerWin);
        this.elProbCpu.textContent = format(results.cpuWin);
        this.elProbTie.textContent = format(results.tie);
        
        this.elTime.textContent = `Time: ${timeMs.toFixed(0)}ms`;
        this.elScenarios.textContent = mode === 'exact' 
            ? `Scenarios: ${results.totalScenarios.toLocaleString()}`
            : `Simulations: ${results.totalSimulations.toLocaleString()}`;
            
        // Style winner
        this.elProbPlayer.parentElement.classList.toggle('highlight', results.playerWin > results.cpuWin);
        
        // Render Distribution
        this.renderDistribution(results.handDistribution);
    }
    
    renderDistribution(distData) {
        const container = document.getElementById('distribution-list');
        container.innerHTML = '';
        
        if (!distData) {
            container.innerHTML = '<div style="color: #ef4444; padding: 10px;">No distribution data available. Please clear your browser cache and refresh.</div>';
            return;
        }
        
        const sortedKeys = Object.keys(distData).map(Number).sort((a,b) => b - a); // 10 down to 1 (RF -> HC)
        
        sortedKeys.forEach(rank => {
            const data = distData[rank];

            if (data.probability > 0) {
                const row = document.createElement('div');
                row.className = 'dist-row';
                
                const percent = (data.probability * 100).toFixed(2) + '%';
                const winRate = data.winRate * 100;
                
                let barClass = 'mixed';
                let winTextClass = '';
                let winDesc = '';
                
                if (winRate > 60) {
                    barClass = 'mostly-win'; // Green
                    winTextClass = 'good';
                    winDesc = `Wins ${winRate.toFixed(0)}%`;
                } else if (winRate < 40) {
                    barClass = 'mostly-loss'; // Red
                    winTextClass = 'bad';
                    winDesc = `Loses ${(100-winRate).toFixed(0)}%`;
                } else {
                    winDesc = `Wins ${winRate.toFixed(0)}%`;
                }

                row.innerHTML = `
                    <div class="row-main">
                        <div class="dist-name">${data.name}</div>
                        <div class="dist-bar-container">
                            <div class="dist-bar ${barClass}" style="width: ${percent}"></div>
                        </div>
                        <div class="dist-percent">${percent}</div>
                        <div class="dist-winrate ${winTextClass}">${winDesc}</div>
                    </div>
                `;
                
                if (data.causingHands && data.causingHands.length > 0) {
                    const cardsContainer = document.createElement('div');
                    cardsContainer.className = 'causing-cards hidden';
                    
                    const limit = 50;
                    const handsToShow = data.causingHands.slice(0, limit);
                    
                    let html = '<div class="causing-label">Contributing CPU Hands (Sample):</div><div class="hands-grid">';
                    handsToShow.forEach(handStr => {
                        const [c1, c2] = handStr.split(',');
                        html += `<div class="mini-hand">
                                    ${this.renderMiniCard(c1)}
                                    ${this.renderMiniCard(c2)}
                                 </div>`;
                    });
                     if (data.causingHands.length > limit) {
                        html += `<div class="more-indicator">+${data.causingHands.length - limit} more</div>`;
                    }
                    html += '</div>';
                    cardsContainer.innerHTML = html;
                    
                    row.querySelector('.row-main').addEventListener('click', () => {
                         cardsContainer.classList.toggle('hidden');
                    });
                    
                     row.appendChild(cardsContainer);
                }
                
                container.appendChild(row);
            }
        });
    }

    renderMiniCard(cardStr) {
        const rank = cardStr.slice(0, -1);
        const suit = cardStr.slice(-1);
        const suitSymbols = {'c': '♣', 'd': '♦', 'h': '♥', 's': '♠'};
        const isRed = suit === 'h' || suit === 'd';
        
        return `<span class="mini-card ${isRed ? 'red' : 'black'}">${rank}${suitSymbols[suit]}</span>`;
    }
}

new App();
