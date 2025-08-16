# Game Design Document: 33 Duels

## 1. High-Level Concept

**33 Duels** is a fast-paced, high-energy, micro-roguelike auto-battler. The player must win 33 consecutive one-on-one duels against randomly generated opponents to become the last human on Earth. The core loop is built around choosing one of three random upgrades before each fight, creating chaotic and strategic builds that clash in spectacular, 10-second battles.

## 2. Game Flow & Core Loop

The player experiences a tight, repeatable loop designed for maximum engagement and a "one more run" feeling.

1. **Upgrade Phase:** The player is presented with three random, distinct upgrades. They can see the opponent's current build and must choose one upgrade to add to their own arsenal.  
2. **Pre-Battle Hype:** A dramatic, screen-shaking transition signals the start of the duel.  
3. **Combat Phase:** A chaotic, physics-based auto-battle unfolds. Characters automatically use their abilities and weapons. The fight is designed to be a quick, visually spectacular event lasting under 10 seconds.  
4. **Victory/Defeat:**  
   * **Victory:** A massive "YOU WIN" screen appears with over-the-top particle effects and sound. The game displays the new, drastically reduced global population and a historical factoid related to that era. The player proceeds to the next duel.  
   * **Defeat:** The run ends. The player is encouraged to start a new 33-duel run immediately.  
5. **Repeat:** The loop continues for 33 duels.

## 3. Player & Opponent Progression

The sense of power escalation is central to the experience.

* **Player:** Starts with 2 HP and 0 upgrades. Before the first duel, they select their first upgrade. After each victory, they select one more, accumulating a total of 33 upgrades by the final duel.  
* **Opponent:** The opponent is a mirror in terms of power level. They will always have the same number of *randomly assigned* upgrades as the player. This ensures a fair, but unpredictable, challenge in every duel.

## 4. The Upgrade System

Upgrades are the heart of the game's strategy and chaos. They are designed to be simple to understand but have complex, emergent interactions.

### Categories:

* **Weapons:** Define the character's basic attack.  
  * *Examples: Battle Axe, Single-Shot Pistol, Baseball Bat, Throwing Knives.*  
* **Armor/Defense:** Provide passive survivability.  
  * *Examples: "Scrap Armor" (ignores the first instance of damage), "Spiked Vest" (deals 1 damage back when hit), "+2 HP."*  
* **Abilities (Active/Passive):** Game-changing skills that can turn the tide.  
  * *Examples: "Last Stand" (when you lose your last HP, deal 1 damage back), "Ricochet" (your bullets can bounce once), "Shadow Trail" (move faster and leave a damaging trail).*  
* **Companions:** AI-controlled allies who fight alongside the player.  
  * *Examples: Feral Dog, Attack Rat, A Moose.*  
* **Special / Thematic:**  
  * **"Black Cat":** The signature upgrade for the "Black Cat" game jam theme. During the fight, a black cat sprints across the arena. If it crosses the opponent's path, it instantly removes/disables half of their upgrades for the duration of the duel.

## 5. Art & Audio Direction: "The Juice"

The game's feel is defined by overwhelming sensory feedback. The goal is to make every moment feel impactful and exciting.

* **Visuals:**  
  * **Constant Screen Shake:** The screen shakes on menu clicks, during the pre-battle countdown, on every hit, and on victory.  
  * **Extreme Particles:** Explosions, blood, sparks, and light trails should fill the screen.  
  * **Fast Movement:** Characters dash and leap across the arena, leaving behind visual trails (e.g., after-images or shadows).  
  * **Impact Frames:** The game should briefly freeze and flash on critical hits or kills.  
* **Audio:**  
  * **Hard-Hitting SFX:** Every action should have a satisfying, exaggerated sound effect—gunshots, metal clangs, squelching hits, ricochets.  
  * **Announcer:** A hype-man announcer shouts "3, 2, 1, FIGHT\!", "FINISH HIM\!", and screams with the crowd.  
  * **Dynamic Music:** The music should be high-energy electronic or rock that intensifies as the duel progresses.

## 6. Narrative & Theme

The narrative is light but provides a compelling backdrop for the action.

* **The Last Human:** The player is fighting through a single-elimination tournament against the entire human race (starting at \~8 billion).  
* **Reverse History:** Each victory screen turns back the clock on human civilization.  
  * **Round 1:** "Population: 4 Billion. Humanity is back to 1973."  
  * **Round 2:** "Population: 2 Billion. Welcome to 1927, the year of the first transatlantic phone call."  
  * **Round 10:** "Population: 1 Billion. It's 1804\. Napoleon is crowned Emperor of France."  
* **The End Goal:** To win all 33 duels and become the sole remaining proto-human, standing alone at the dawn of time.
