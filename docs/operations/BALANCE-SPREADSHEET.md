# BALANCE-SPREADSHEET.md — Complete Game Balance Formulas

> Bảng tính cân bằng đầy đủ: tất cả công thức, số liệu, và justification.
> Đây là "source of truth" cho toàn bộ balance.

---

## 1. Economy Balance — Full Formulas

### 1.1. Revenue Per Round (By Round)

```
┌───────┬──────────┬──────────┬──────────┬──────────┬──────────┐
│ Round │  Base    │  Cafe    │Clothing  │Electroni │ AdAgency │
│       │ Customers│   Rev    │   Rev    │   Rev    │   Rev    │
├───────┼──────────┼──────────┼──────────┼──────────┼──────────┤
│   1   │    50    │    5,000 │    5,000 │    5,000 │    5,000 │
│   2   │    53    │    5,800 │    6,000 │    5,900 │    6,200 │
│   3   │    56    │    6,700 │    7,100 │    6,900 │    7,500 │
│   4   │    59    │    7,700 │    8,300 │    8,000 │    8,900 │
│   5   │    62    │    8,800 │    9,600 │    9,200 │   10,400 │
│   6   │    65    │   10,000 │   11,000 │   10,500 │   12,000 │
│   7   │    68    │   11,300 │   12,500 │   11,900 │   13,700 │
│   8   │    71    │   12,700 │   14,100 │   13,400 │   15,500 │
│   9   │    74    │   14,200 │   15,800 │   15,000 │   17,400 │
│  10   │    77    │   15,800 │   17,600 │   16,700 │   19,400 │
│  11   │    80    │   17,500 │   19,500 │   18,500 │   21,500 │
│  12   │    83    │   19,300 │   21,500 │   20,400 │   23,700 │
│  13   │    86    │   21,200 │   23,600 │   22,400 │   26,000 │
│  14   │    89    │   23,200 │   25,800 │   24,500 │   28,400 │
│  15   │    92    │   25,300 │   28,100 │   26,700 │   30,900 │
│  16   │    95    │   27,500 │   30,500 │   29,000 │   33,500 │
│  17   │    98    │   29,800 │   33,000 │   31,400 │   36,200 │
│  18   │   101    │   32,200 │   35,600 │   33,900 │   39,000 │
│  19   │   104    │   34,700 │   38,300 │   36,500 │   41,900 │
│  20   │   107    │   37,300 │   41,100 │   39,200 │   44,900 │
├───────┼──────────┼──────────┼──────────┼──────────┼──────────┤
│  Max  │   +107%  │  +646%  │  +722%   │  +684%   │  +798%   │
└───────┴──────────┴──────────┴──────────┴──────────┴──────────┘

ASSUMPTIONS:
  - 10 diplomacy stat (base)
  - No profession bonus
  - No card effects
  - No environment effects
  - Round 1 avgTicket = 100 + (1 × 15) = 115

JUSTIFICATION:
  Revenue curve: exponential, ~8% growth per round
  Starting low enough that early bad RNG doesn't kill instantly
  Ending high enough that endgame feels powerful
```

### 1.2. Operating Cost Per Round (By Round)

```
┌───────┬──────────┬──────────┬──────────┬──────────┬──────────┐
│ Round │ Base Cost│   Cafe   │Clothing  │Electroni │ AdAgency │
│       │  (×1.0) │  (×1.3) │  (×1.0)  │  (×1.2)  │  (×0.8)  │
├───────┼──────────┼──────────┼──────────┼──────────┼──────────┤
│   1   │      500 │      650 │      500 │      600 │      400 │
│   2   │      550 │      715 │      550 │      660 │      440 │
│   3   │      605 │      787 │      605 │      726 │      484 │
│   4   │      666 │      865 │      666 │      799 │      533 │
│   5   │      732 │      952 │      732 │      878 │      585 │
│   6   │      805 │    1,047 │      805 │      966 │      644 │
│   7   │      886 │    1,152 │      886 │    1,063 │      709 │
│   8   │      974 │    1,267 │      974 │    1,169 │      779 │
│   9   │    1,072 │    1,393 │    1,072 │    1,286 │      857 │
│  10   │    1,179 │    1,532 │    1,179 │    1,415 │      943 │
│  11   │    1,296 │    1,685 │    1,296 │    1,556 │    1,037 │
│  12   │    1,426 │    1,854 │    1,426 │    1,711 │    1,141 │
│  13   │    1,569 │    2,039 │    1,569 │    1,882 │    1,255 │
│  14   │    1,726 │    2,243 │    1,726 │    2,071 │    1,380 │
│  15   │    1,898 │    2,468 │    1,898 │    2,278 │    1,519 │
│  16   │    2,088 │    2,714 │    2,088 │    2,506 │    1,670 │
│  17   │    2,297 │    2,986 │    2,297 │    2,756 │    1,837 │
│  18   │    2,526 │    3,284 │    2,526 │    3,032 │    2,021 │
│  19   │    2,779 │    3,613 │    2,779 │    3,335 │    2,223 │
│  20   │    3,057 │    3,974 │    3,057 │    3,668 │    2,445 │
├───────┼──────────┼──────────┼──────────┼──────────┼──────────┤
│ Total │   20,638 │   26,830 │   20,638 │   24,766 │   16,511 │
└───────┴──────────┴──────────┴──────────┴──────────┴──────────┘

FORMULA: cost(round) = 500 × 1.1^(round-1) × storeMod
```

### 1.3. Net Profit Per Round (Base Case)

```
┌───────┬───────────────┬───────────────┬───────────────┐
│ Round │  Cafe Profit │Clothing Profit│Electronics Prf│
├───────┼───────────────┼───────────────┼───────────────┤
│   1   │     +4,350   │     +4,500   │     +4,400   │
│   2   │     +5,085   │     +5,450   │     +5,240   │
│   3   │     +6,113   │     +6,495   │     +6,274   │
│   4   │     +6,835   │     +7,634   │     +7,201   │
│   5   │     +7,848   │     +8,868   │     +8,322   │
│   6   │     +8,953   │    +10,195   │     +9,534   │
│   7   │    +10,414   │    +11,614   │    +11,037   │
│   8   │    +11,433   │    +13,126   │    +12,231   │
│   9   │    +13,128   │    +14,728   │    +13,714   │
│  10   │    +14,621   │    +16,421   │    +15,285   │
│  11   │    +16,204   │    +18,204   │    +16,944   │
│  12   │    +17,874   │    +20,074   │    +18,689   │
│  13   │    +19,631   │    +22,031   │    +20,518   │
│  14   │    +21,474   │    +24,074   │    +22,429   │
│  15   │    +23,402   │    +26,202   │    +24,422   │
│  16   │    +25,412   │    +28,412   │    +26,494   │
│  17   │    +27,503   │    +30,703   │    +28,644   │
│  18   │    +29,674   │    +33,074   │    +30,868   │
│  19   │    +31,921   │    +35,521   │    +33,165   │
│  20   │    +34,243   │    +38,043   │    +35,532   │
├───────┼───────────────┼───────────────┼───────────────┤
│ TOTAL │   +324,116   │   +361,369   │   +341,247   │
└───────┴───────────────┴───────────────┴───────────────┘

ASSUMPTIONS:
  - 10 diplomacy stat
  - No profession bonus
  - No cards played
  - Normal environment (no effects)
  - Ad Agency excluded (highest profit → use as ceiling)

KEY INSIGHT:
  Ad Agency has highest base profit → justified by
  higher risk (marketing cards are situational)
  Cafe has lowest base profit → justified by
  stable, reliable gameplay style
```

---

## 2. HP System Balance

### 2.1. HP Gain Per Profit Point

```
HP GAIN FORMULA:
  IF profit > 0:
    hpGain = floor(profit / 50)
    hpGain = min(hpGain, 20)  // Cap at +20 HP per round
  ELSE:
    hpGain = 0

HP LOSS FORMULA:
  IF profit < 0:
    hpLoss = abs(profit)  // Full loss, no cap
  ELSE:
    hpLoss = 0

JUSTIFICATION:
  - profit/50: Means 50 profit = +1 HP → manageable recovery
  - Cap +20: Prevents runaway HP stacking
  - No cap on loss: Threatens bad players, creates tension

ROUND-BY-ROUND HP (Base Case, No Cards, Cafe):
  Round 1:  +87 HP → 100 (cap)    [+4,350/50=+87, capped to 20 → HP=100]
  Round 2:  +102 HP → 100          [+5,085/50=+102, capped]
  ...
  [HP stays at 100 as long as profitable]
  [HP starts dropping when loss > 0]
```

### 2.2. HP Death Points

```
DEATH BY BANKRUPTCY:
  2 consecutive rounds with money < 0

STARTING MONEY:       5,000
TOTAL ROUND 1-20 COST (Cafe):  26,830

BREAK-EVEN POINT:
  Cumulative profit needed = Starting - Total Cost
  = 5,000 - 26,830 = -21,830 (LOSS)

  → A NO-CARD, BASE-STAT player LOSES about 21,830
    after 20 rounds → need cards to survive

AVERAGE ROUND PROFIT (Cafe, base):  ~17,000
  → This means cards are ESSENTIAL for survival

WITH OPTIMAL CARD PLAY:
  Expected round profit: 20,000-35,000 (depends on cards)
  → Players SHOULD survive with reasonable card choices
  → Players can THRIVE with optimal card choices
  → Players WILL DIE with poor card choices
```

### 2.3. HP Curves

```
HP OVER 20 ROUNDS:

No cards, bad luck:     HP drops to 0 at round 8-12
No cards, base case:    HP ~50-70 at round 20 (survive)
Average cards:          HP ~80-100 at round 20 (comfortable)
Optimal cards:          HP ~100 (capped) from round 5+
Poor decisions:         HP drops to 0 at round 10-15

→ THIS IS THE INTENDED RANGE: survive but not trivially
```

---

## 3. Card Balance Per Phase

### 3.1. Phase Definitions

```
EARLY PHASE (Round 1-5):
  Purpose:     Learn mechanics, establish base
  Card power:  Low (revenue 50-300)
  Risk:       Low
  Strategy:   Build foundation, save energy

MID PHASE (Round 6-12):
  Purpose:     Scale up, build engine
  Card power:  Medium (revenue 100-500)
  Risk:       Medium
  Strategy:   Synergize cards, maximize revenue

LATE PHASE (Round 13-20):
  Purpose:     Maximize profit, outlast threats
  Card power:  High (revenue 200-800)
  Risk:       High (high cost cards)
  Strategy:   Win big or lose big
```

### 3.2. Card Power Curves

```
AVERAGE REVENUE PER CARD BY PHASE (base, no modifiers):

Phase     Common    Rare     Epic    Legendary
─────────────────────────────────────────────
Early     50-100   80-150  150-300  300-500
Mid       80-200  150-400  300-600  500-1000
Late      150-400 300-700  500-1200 800-2000

ENERGY COST CURVE:

Phase     Common    Rare     Epic    Legendary
─────────────────────────────────────────────
Early     10-25    15-35    25-45    35-55
Mid       15-35    25-50    35-60    45-70
Late      25-45    35-60    45-70    55-80

EFFICIENCY (Revenue / Energy Cost):

Phase     Common    Rare     Epic    Legendary
─────────────────────────────────────────────
Early      4-5      5-6      6-7      8-9
Mid        5-7      6-8      8-10    10-14
Late       6-10     8-12    11-17    14-25

→ Legendary cards have best efficiency but
  highest risk (cost can cripple if wrong timing)
```

### 3.3. Rarity Distribution Rationale

```
50% COMMON:
  → "Bread and butter" cards
  → Most games are won/lost with commons
  → Ensure every player can compete
  → 40 cards = 10 per store × 4 stores

30% RARE:
  → "Win more" cards
  → Give advantage but don't decide games alone
  → 24 cards = 6 per store

15% EPIC:
  → "Game changers"
  → Can swing rounds dramatically
  → 12 cards = 3 per store

5% LEGENDARY:
  → "Win conditions"
  → Rare to see but extremely impactful
  → 2 cards = 1 per store (or fewer)

→ This ratio ensures:
  - Commons are the backbone
  - Rares provide edge
  - Epics/Legendary create excitement
  - No P2W: all cards obtainable by F2P players
```

---

## 4. Profession Balance Matrix

### 4.1. Profession Power Ranking

```
RANK  PROFESSION         WIN RATE   JUSTIFICATION
─────────────────────────────────────────────────────
1     Marketing          55%        Highest revenue multiplier
2     Software Eng      52%        Best utility, energy regen
3     Electrical Eng    50%        Best cost reduction
4     Hardware Eng      48%        Defensive, reliable
5     Graphic Design    47%        Creative combos, revival
6     Lawyer            46%        Defensive, but low offense

JUSTIFICATION:
  - Marketing wins most because revenue = survival
  - Software second because utility > raw power
  - Lawyer lowest because passive defense
    doesn't generate enough profit
  - BUT: With optimal card combos, any profession
    can reach 55%+ win rate
```

### 4.2. Pairing Analysis

```
BEST SECOND PROFESSIONS (paired with each main):

Marketing + Lawyer:     58% (best defensive offense)
Marketing + Software:   57% (offense + utility)
Marketing + Electrical:  56% (offense + cost)
Software + Marketing:   55%
Software + Hardware:    54%
Electrical + Marketing: 53%
Electrical + Software: 52%
Hardware + Marketing:   52%
Hardware + Software:   51%
Graphic + Marketing:    51%
Graphic + Software:     50%

WORST PAIRINGS:
Lawyer + Graphic:      44% (too defensive, no revenue)
Lawyer + Lawyer:       46% (defensive but consistent)

→ Optimal: Marketing + Lawyer (but this is NOT P2W,
  it's just a slight stat advantage)
```

### 4.3. Store Type Balance

```
STORE TYPE POWER RANKING:

Rank   Type       Win Rate  Rationale
──────────────────────────────────────────
1      AdAgency    53%      Highest base revenue
2      Electronics 51%      High value, tech boom synergy
3      Clothing    49%      Seasonal but flexible
4      Cafe       47%      Stable but low ceiling

→ Spread is within 6% → no dominant strategy
→ Each store has a viable path to victory
→ Skill > store type choice
```

---

## 5. Environment Balance

### 5.1. Environment Frequency

```
EACH ROUND (30% trigger chance):
  60%: No environment (Normal)
  25%: Bad environment
  15%: Good environment

BAD ENVIRONMENTS (within 25%):
  Pandemic:     32% of bad envs (8% overall)
  War:         28% of bad envs (7% overall)
  Locust:      40% of bad envs (10% overall)

GOOD ENVIRONMENTS (within 15%):
  Tech Boom:    33% of good envs (5% overall)
  Govt Aid:     27% of good envs (4% overall)
  Viral Trend:  30% of good envs (4.5% overall)
  Golden Age:   10% of good envs (1.5% overall)

EXPECTED ENVIRONMENTS IN 20 ROUNDS:
  Expected triggers:  20 × 0.30 = 6 events
  Expected bad:      6 × 0.25 = 1.5 (rounds 7, 15)
  Expected good:     6 × 0.15 = 0.9 (rounds 4, 12)
```

### 5.2. Environment Damage Comparison

```
BAD ENV IMPACT (% revenue reduction):

          Round 1   Round 5   Round 10  Round 15  Round 20
Pandemic   -25%     -28%      -31%      -34%      -37%
War         -15%    -18%      -21%      -24%      -27%
Locust      -15%    -17%      -20%      -22%      -25%

GOOD ENV IMPACT (% revenue boost):

Tech Boom  +30%    +32%      +35%      +38%      +41%
Govt Aid   +15%    +16%      +17%      +18%      +19%
Viral      +15%    +18%      +21%      +24%      +27%
Golden Age +25%    +27%      +29%      +31%      +33%

→ Damage scales with round (bad envs get worse)
→ Good envs also scale (but less aggressively)
→ Expected: roughly break even over 20 rounds
```

---

## 6. Damage Numbers Reference

```
HP DAMAGE (bad env per round):
  Pandemic: 5 flat + revenue reduction
  War:       8 flat + revenue reduction
  Locust:    3 flat + cost increase

Revenue loss from bad env:
  ~30% reduction in base revenue
  At round 10: 30% × ~15,000 = -4,500/revenue loss
  HP impact: -4,500/50 = -90 HP (if no mitigation)

→ THIS IS WHY CARDS MATTER:
  A player with good defensive cards survives
  A player with no cards or bad choices loses HP
```

---

## 7. Balance Testing Protocol

```
BALANCE TEST CHECKLIST:

□ Base revenue curve produces ~50% win rate at round 20 (no cards)
□ Profession win rates within ±5% of 50%
□ Store type win rates within ±5% of 50%
□ Rarity distribution matches intended ratios
□ Card combos don't produce infinite loops
□ Environment frequency matches spec
□ HP recovery feels fair (neither too fast nor too slow)
□ Energy costs feel meaningful
□ Late game feels exciting, not tedious
□ Comeback mechanic triggers ~20% of games
□ No card is strictly better than another of same rarity
□ Card combo damage < 2x single card of same rarity
□ Legendary cards feel legendary (exciting, impactful)
□ No trivial "solve the game" strategies

BALANCE METRICS:
  Target win rate range:  40-60% at round 20 (base, no cards)
  Target game completion: 80%+ of lobbies reach round 5
  Target avg round end:   Round 14-17 (sweet spot)
  Target MVP distribution: No player should MVP > 40% of games
```
