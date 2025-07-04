
  let playerLevel = 1;
  let playerEXP = 0;
  const expToNextLevel = () => playerLevel * 10;

  const mapWidth = 10;
  const mapHeight = 13;
  const enemySpawn = { x: 6, y: 7 }; // oryginalna pozycja przeciwnika
  const startPos = { x: 1, y: 1 }; // pozycja startowa gracza
  const MAX_LOG_LINES = 10;
 
  function drawStats() {
  let output = "=== KARTA POSTACI ===\n";
  output += `Pozycja: (${player.x}, ${player.y})\n`;
  output += `HP: ${playerStats.hp} / ${playerStats.maxHP}\n`;
  output += `MP: ${playerStats.mp} / ${playerStats.maxMP}\n`;
  output += `Poziom: ${playerLevel} | EXP: ${playerEXP} / ${expToNextLevel()}\n`;
  output += `W walce: ${inCombat ? "TAK" : "NIE"}\n`;
  output += `Przeciwnik: ${enemyAlive ? "Obecny" : "Ded (resp Inc)"}\n`;
  output += `Atak: ${getPlayerAttack()} | Obrona: ${getPlayerDefense()}\n`;
  document.getElementById("stats").textContent = output;
}

function drawEquipment() {
  let output = "=== EKWIPUNEK ===\n";
  for (let slot in playerEquipment) {
    const item = playerEquipment[slot];
    const usable = playerLevel >= item.req;
    output += `${slot}: ${item.name} ${usable ? "" : `(wym. lvl ${item.req})`}\n`;
  }
  document.getElementById("equipment").textContent = output;
}

let allItems = {
  miecz: { name: "Miecz", atk: 3, def: 0, req: 3 },
  tarcza: { name: "Tarcza", atk: 0, def: 2, req: 4 },
  zbroja: { name: "Zbroja", atk: 0, def: 1, req: 1 },
  spodnie: { name: "krotkie spodnie", atk: 0, def: 1, req: 1 },
  helm: { name: "helm pikowany", atk: 1, def: 1, req: 1 }
};

let playerEquipment = {
  helm: allItems.helm,
  pancerz: allItems.zbroja,
  spodnie: allItems.spodnie,
  reka: allItems.miecz,
  drugaReka: allItems.tarcza
};

function getPlayerAttack() {
  return 1 + Object.values(playerEquipment).reduce((sum, item) => {
    return sum + (playerLevel >= item.req ? item.atk : 0);
  }, 0);
}

function getPlayerDefense() {
  return 0 + Object.values(playerEquipment).reduce((sum, item) => {
    return sum + (playerLevel >= item.req ? item.def : 0);
  }, 0);
}

function appendToLog(text, turn = null) {
  const logEl = document.getElementById("log");
  const entry = document.createElement("div");
  entry.classList.add("log-entry");

  // Prefix tury
  if (turn !== null) {
    text = `[TURA ${turn}] ${text}`;
  }

  // Ustal kolor na podstawie treści
  if (text.includes("obrażeń magicznych")) {
    entry.classList.add("magic");
  } else if (text.includes("zadajesz") || text.includes("Atakujesz")) {
    entry.classList.add("attack");
  } else if (text.includes("Odzyskujesz") || text.includes("odpoczywasz")) {
    entry.classList.add("heal");
  } else if (text.includes("Wróg zadaje")) {
    entry.classList.add("enemy");
  } else {
    entry.classList.add("info");
  }

  entry.textContent = text;
  logEl.appendChild(entry);
  logEl.scrollTop = logEl.scrollHeight;
}


  let enemyAlive = true;
  let combatTurnNumber = 1;

  let map = [
    "##########",
    "#........#",
    "#..####..#",
    "#..#...#.#",
    "#..#...#.#",
    "#..#...#.#",
    "#..####..#",
    "#.....&..#",
    "#........#",
    "#........#",
    "#........#",
    "#........#",
    "##########"
  ].map(row => row.split(""));

  let player = { x: 1, y: 1, direction: "down" };
  
  let inCombat = false;
  
  let playerStats = {
  hp: 10,
  mp: 2,
  maxHP: 10,
  maxMP: 2
};

combatData = {
  playerHP: playerStats.maxHP,
  playerMP: playerStats.maxMP,
  enemyHP: 20,
  enemyATK: 1,
  enemyDEF: 4,
  defending: false
};

  function drawMap() {
    let output = "";
    for (let y = 0; y < mapHeight; y++) {
      for (let x = 0; x < mapWidth; x++) {
        if (x === player.x && y === player.y) {
  let symbol = "@";
  if (player.direction === "up") symbol = "↑";
  if (player.direction === "down") symbol = "↓";
  if (player.direction === "left") symbol = "←";
  if (player.direction === "right") symbol = "→";
  output += symbol;
} else {
          output += map[y][x];
        }
      }
      output += "\n";
    }
    document.getElementById("game").textContent = output;
  }

  document.getElementById("log").innerHTML = '<div class="log-header">[ LOG WALKI ]</div>';

  function drawCombat() {
  if (!inCombat) {
    document.getElementById("combat").textContent = "[ WALKA NIEAKTYWNA ]";
    return;
  }

  let output = "=== WALKA TUROWA ===\n";
  output += `Gracz HP: ${combatData.playerHP} | MP: ${combatData.playerMP}\n`;
  output += `Wróg  HP: ${combatData.enemyHP}\n\n`;
  output += "Wybierz akcję:\n";
  output += "1 - Atak\n";
  output += "2 - Magia (koszt 1 MP)\n";
  output += "3 - Obrona\n";
  output += "4 - Czekaj\n";
  output += "5 - Ucieczka\n";
  document.getElementById("combat").textContent = output;
}

function startCombat() {
  inCombat = true;
  combatTurnNumber = 1;

  combatData = {
    playerHP: playerStats.hp,
    playerMP: playerStats.mp,
    enemyHP: 20,
    enemyATK: 1,
    enemyDEF: 4,
    defending: false
  };

  drawCombat();
}

function endCombat(result) {
  inCombat = false;

  if (result !== "escape") {
    playerStats.hp = combatData.playerHP;
    playerStats.mp = combatData.playerMP;
  }

  drawCombat();
  drawStats();
  drawEquipment();

  if (result === "win") {
    playerEXP += 5;
    appendToLog(`Zdobywasz 5 EXP. (${playerEXP}/${expToNextLevel()})`);

    if (playerEXP >= expToNextLevel()) {
    playerEXP -= expToNextLevel();
    playerLevel++;
    playerStats.maxHP += 2;
    playerStats.maxMP += 1;
    playerStats.hp = playerStats.maxHP;
    playerStats.mp = playerStats.maxMP;
    appendToLog(`AWANS! Osiągasz poziom ${playerLevel}! Twoje HP i MP wzrastają.`);
}
    enemyAlive = false;
    map[enemySpawn.y][enemySpawn.x] = "X";
    drawMap();

    setTimeout(() => {
      if (!enemyAlive) {
        map[enemySpawn.y][enemySpawn.x] = "&";
        enemyAlive = true;
        drawMap();
      }
    }, 10000);
  }

  if (result === "lose") {
    alert("Zginąłeś! Powracasz na pozycję startową...");
    player.x = startPos.x;
    player.y = startPos.y;
    playerStats.hp = playerStats.maxHP;
    playerStats.mp = playerStats.maxMP;
    drawMap();
  }
}

function combatTurn(action) {
  let playerLog = "";
  let enemyLog = "";

  if (action === "1") {
    const baseAtk = getPlayerAttack();
const dmgRoll = Math.floor(Math.random() * 3); // losowe 0–2
const totalDmg = Math.max(0, baseAtk + dmgRoll - combatData.enemyDEF);
combatData.enemyHP -= totalDmg;
playerLog += `Atakujesz fizycznie i zadajesz ${totalDmg} obrażeń! (ATK: ${baseAtk}, DEF przeciwnika: ${combatData.enemyDEF})`;
  }
  else if (action === "2") {
    if (combatData.playerMP > 0) {
      const magicDmg = Math.floor(Math.random() * 4) + 3;
      combatData.enemyHP -= magicDmg;
      combatData.playerMP -= 1;
      playerLog += `Rzucasz zaklęcie i zadajesz ${magicDmg} obrażeń magicznych! (pozostało ${combatData.playerMP} MP)`;
    } else {
      playerLog += "Nie masz wystarczająco many, by rzucić czar!";
      appendToLog(playerLog, combatTurnNumber);
      drawCombat();
      drawStats();
      drawEquipment();
      return;
    }
  }
  else if (action === "3") {
    combatData.defending = true;
    playerLog += `Przygotowujesz się do obrony!`;
  }
  else if (action === "4") {
  const healedHP = Math.min(playerStats.maxHP, combatData.playerHP + 3);
  const restoredMP = Math.min(playerStats.maxMP, combatData.playerMP + 1);
  const hpGain = healedHP - combatData.playerHP;
  const mpGain = restoredMP - combatData.playerMP;
  combatData.playerHP = healedHP;
  combatData.playerMP = restoredMP;
  playerLog += `Odpoczywasz... Odzyskujesz ${hpGain} HP i ${mpGain} MP.`;
}
  else if (action === "5") {
    playerLog += "Uciekasz z walki!";
    appendToLog(playerLog, combatTurnNumber);
    endCombat("escape");
    return;
  }

  appendToLog(playerLog, combatTurnNumber); // log gracza

  if (combatData.enemyHP <= 0) {
    appendToLog("Pokonałeś wroga!", combatTurnNumber);
    endCombat("win");
    if (playerEXP >= expToNextLevel()) {
    playerEXP -= expToNextLevel();
    playerLevel++;
    playerStats.maxHP += 2;
    playerStats.maxMP += 1;
    playerStats.hp = playerStats.maxHP;
    playerStats.mp = playerStats.maxMP;
    appendToLog(`AWANS! Osiągasz poziom ${playerLevel}! Twoje HP i MP wzrastają.`);

    drawStats(); // ← odświeża statystyki na ekranie
    }
    return;
  }

  const enemyRoll = Math.floor(Math.random() * 5) + 1;
  const enemyDmg = combatData.enemyATK + enemyRoll;
  const rawDmg = enemyDmg - getPlayerDefense();
  let finalDmg = combatData.defending ? Math.max(0, rawDmg - 2) : Math.max(0, rawDmg);
  combatData.playerHP -= finalDmg;
  enemyLog += `Wróg zadaje ${finalDmg} obrażeń!`;

  appendToLog(enemyLog, combatTurnNumber); // log przeciwnika

  if (combatData.playerHP <= 0) {
    appendToLog("Zostałeś pokonany!", combatTurnNumber);
    endCombat("lose");
    return;
  }

  combatData.defending = false;
  drawCombat();
  drawStats();
  drawEquipment();
  combatTurnNumber++; // Zwiększamy turę na koniec
}

  document.addEventListener("keydown", (e) => {
    if (inCombat) {
  if (["1", "2", "3", "4", "5"].includes(e.key)) {
    combatTurn(e.key);
  }
  return;
}

document.addEventListener("keydown", (e) => {
  if (e.key === " ") { // Naciśnięcie spacji
    const enemyPos = { x: enemySpawn.x, y: enemySpawn.y };

    // Sprawdzamy, czy gracz stoi obok przeciwnika
    const isAdjacent = Math.abs(player.x - enemyPos.x) <= 1 && Math.abs(player.y - enemyPos.y) <= 1;

    // Sprawdzamy, czy gracz jest zwrócony w stronę przeciwnika
    let canFight = false;

    if (isAdjacent) {
      switch (player.direction) {
        case "up":
          if (player.x === enemyPos.x && player.y > enemyPos.y) canFight = true;
          break;
        case "down":
          if (player.x === enemyPos.x && player.y < enemyPos.y) canFight = true;
          break;
        case "left":
          if (player.y === enemyPos.y && player.x > enemyPos.x) canFight = true;
          break;
        case "right":
          if (player.y === enemyPos.y && player.x < enemyPos.x) canFight = true;
          break;
      }
    }

    if (canFight) {
      startCombat();
    }
  }
});


    let newX = player.x;
    let newY = player.y;

    if (e.key === "ArrowUp") {
  newY--;
  player.direction = "up";
}
    if (e.key === "ArrowDown") {
  newY++;
  player.direction = "down";
}
    if (e.key === "ArrowLeft"){
  newX--;
  player.direction = "left";
}
    if (e.key === "ArrowRight") {
  newX++;
  player.direction = "right";
}

    if (newX < 0 || newY < 0 || newX >= mapWidth || newY >= mapHeight) return;

    const targetTile = map[newY][newX];

    // Wchodzisz na przeciwnika — uruchamia się walka
    if (targetTile === "&") {
      player.x = newX;
      player.y = newY;
      startCombat();
      drawStats();
      drawEquipment();
      drawMap();
      return;
    }

    if (targetTile !== "#") {
      player.x = newX;
      player.y = newY;      
    }       
        
    drawMap();      
    drawStats();        
    drawEquipment();        
  });       

  drawMap();
  drawCombat();
  drawStats();
  drawEquipment();