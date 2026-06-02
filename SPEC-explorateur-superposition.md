# Spécifications — Explorateur de superposition

**Destinataire :** Claude Code
**Objet :** Implémenter une application web interactive servant d'outil pédagogique à l'écran, dans une vidéo expliquant la *superposition* des features dans les réseaux de neurones (toy model d'Anthropic, Elhage et al., 2022).
**Statut :** un prototype mono-fichier fonctionnel existe déjà (voir §3). Cette spec décrit l'application complète à produire à partir de ce prototype.

---

## 1. Contexte et objectif

L'application est manipulée **en direct, devant la caméra**, par un présentateur qui explique la superposition. Ce n'est pas une page de documentation : c'est un *instrument*. Le présentateur bouge un curseur, et le modèle réagit. Le spectateur doit pouvoir suivre des yeux un mécanisme qui se reconfigure en temps réel.

Trois exigences gouvernent tout le reste :

1. **Honnêteté de la déconstruction.** Ce qui est affiché doit être *exactement* le mécanisme réel à l'échelle près — un vrai modèle entraîné par descente de gradient, pas une animation scriptée. Si on ne peut pas dire « ce que vous voyez est, à des détails de scaling près, ce qui se passe dans un vrai transformer », c'est à refaire.
2. **Lisibilité caméra.** Le rendu sera filmé puis recompressé en 1080p. Traits épais, contrastes forts, fond sombre, typographie large.
3. **Sobriété.** Esthétique d'instrument de recherche, pas de page marketing. Fond sombre dominant, 3–4 couleurs, aucun branding tape-à-l'œil.

---

## 2. Périmètre

**Dans le périmètre :**
- Un moteur entraînant le toy model en direct dans le navigateur.
- Huit rendus visuels synchronisés (§7), dont 4 déjà prototypés.
- Contrôles temps réel (sparsité, importance, n, ReLU on/off, presets).
- Un « mode présentation » permettant d'isoler chaque rendu plein écran pour le tournage (§11).

**Hors périmètre :**
- Pas de backend, pas de persistance, pas de comptes. Tout tourne côté client.
- Pas de chargement de poids pré-entraînés depuis un fichier (l'entraînement est live).
- Pas de support mobile prioritaire (cible : écran de tournage, desktop large). Le responsive est un bonus.

---

## 3. Référence comportementale : le prototype existant

Un fichier `explorateur-superposition.html` (mono-fichier, vanilla JS + SVG) implémente déjà et **doit servir de référence de comportement** pour :
- le moteur (modèle + entraînement Adam manuscrit) ;
- le **Rendu 2** (plan caché ℝ², vecteurs/polygones) ;
- le **Rendu 4** (heatmap WᵀW) ;
- le **Rendu 5** (toggle ReLU) ;
- le **Rendu 6** (injection d'un vecteur creux + fantômes d'interférence).

La tâche n'est donc pas de repartir de zéro mais de **porter ce prototype vers une application modulaire et maintenable**, puis d'ajouter les rendus manquants (1, 3, 7, 8) et le mode présentation. Le comportement numérique du prototype est la vérité de référence ; ne pas le régresser.

---

## 4. Le modèle mathématique (à implémenter exactement)

Autoencodeur linéaire à goulot avec non-linéarité ReLU en sortie.

**Dimensions :** `n` features (réglable, 2→6), `m = 2` dimensions cachées (fixe pour les rendus 2D ; voir Rendu 8 pour m > 2).

**Paramètres entraînables :** `W ∈ ℝ^{m×n}`, `b ∈ ℝ^n`.

**Forward :**
```
h  = W · x                    // h ∈ ℝ^m
x̂ = ReLU(Wᵀ · h + b)         // soit x̂ = ReLU(WᵀW · x + b)
```
En mode ReLU OFF, `x̂ = Wᵀh + b` (linéaire pur).

**Génération des données.** À chaque échantillon, chaque composante de `x` vaut 0 avec probabilité `S` (sparsité), sinon est tirée uniformément dans `[0, 1]`. Les composantes sont indépendantes.

**Importance.** `Iᵢ = rⁱ`, `i ∈ {0, …, n−1}`, `r ∈ (0, 1]`. r = 1 → importance uniforme.

**Perte (MSE pondérée par l'importance) :**
```
L = E_x [ Σᵢ Iᵢ · (xᵢ − x̂ᵢ)² ]
```

**Quantités dérivées affichées :**
- Vecteur feature `i` = i-ème colonne de `W`, soit `(W[0][i], W[1][i]) ∈ ℝ²`.
- `WᵀW ∈ ℝ^{n×n}` : `(WᵀW)ᵢⱼ = W[0][i]·W[0][j] + W[1][i]·W[1][j]`.
- Norme `‖Wᵢ‖` = représentation de la feature i. Seuil « représentée » : `‖Wᵢ‖ > 0.32`.
- Hors-diagonale de `WᵀW` = interférence entre features.

---

## 5. Architecture technique

**Stack imposé :** Vite + React 18 + TypeScript. Rendu graphique en **SVG** (vecteurs, barres, heatmap) ; Canvas/Three.js uniquement pour le Rendu 8 (3D). Pas de framework de state lourd : `useState`/`useReducer` + un store léger (Zustand acceptable). Calcul numérique **en TypeScript pur** (le modèle est minuscule, pas besoin de TensorFlow.js).

**Arborescence cible :**
```
src/
  engine/
    model.ts          // forward, génération de données, WtW, normes
    train.ts          // boucle Adam (port du prototype), warm start
    types.ts
  state/
    useExplorer.ts    // store global : n, S, r, useReLU, xin, W, b, loss
  renders/
    R1_Architecture.tsx
    R2_PlaneGeometry.tsx
    R3_Loss.tsx
    R4_HeatmapWtW.tsx
    R5_ReluCompare.tsx
    R6_Injection.tsx
    R7_PhaseDiagram.tsx
    R8_HighDim.tsx
  ui/
    Controls.tsx      // sliders, n-select, ReLU, presets
    Readout.tsx       // compteur représentées / géométrie / perte
    PresenterShell.tsx// layout + mode présentation
  design/
    tokens.css        // couleurs, typo, espacements
  App.tsx
  main.tsx
```

**Séparation stricte moteur/UI.** `engine/` ne doit dépendre d'aucun composant React et doit être testable isolément. Les rendus ne font que lire l'état et dessiner.

---

## 6. Le moteur d'entraînement

**Boucle.** Entraînement continu via `requestAnimationFrame` : à chaque frame, exécuter `K ≈ 24` pas Adam puis publier `W`, `b`, `loss` dans le store. Les rendus se redessinent à partir de l'état publié. Aucun réentraînement ne se déclenche « à part » sur changement de paramètre : le **warm start** suffit (on garde W et l'état Adam, le modèle s'adapte en continu), ce qui produit l'effet « regarder le modèle se réorganiser ».

**Hyperparamètres (repris du prototype) :** `m = 2`, batch `B = 256`, `K = 24` pas/frame, Adam `lr = 0.012`, `β1 = 0.9`, `β2 = 0.999`, `ε = 1e-8`. Init `W ~ U(−0.12, 0.12)`, `b = 0`.

**Réinitialisation.** Changer `n` réinitialise `W`, `b` et l'état Adam (les dimensions changent). Changer `S`, `r` ou `useReLU` ne réinitialise rien (warm start).

**Gradients.** Backprop manuelle (fournie ci-dessous en annexe A) ou autodiff maison ; les deux conviennent vu la taille. Le prototype utilise la version manuelle, déjà validée.

**Performance.** La frame doit rester sous ~8 ms de calcul (≈120 fps de marge). Pour `n ≤ 6`, `B = 256`, `K = 24`, c'est trivialement atteint.

---

## 7. Spécification des rendus

Chaque rendu lit l'état courant et se redessine à chaque frame. Format ci-dessous : *rôle → contenu → interaction → critères d'acceptation*.

### Rendu 1 — Architecture minimale
- **Rôle :** poser l'objet avant le paradoxe (« voici le modèle »).
- **Contenu :** `n` features en colonne à gauche → goulot `m = 2` au centre → reconstruction à droite. Flèches encode/décode visibles.
- **Interaction :** activer/désactiver chaque feature à la main (réutilise `xin`, partagé avec R6).
- **Acceptation :** une feature activée s'illumine, traverse le goulot, ressort ; le goulot affiche clairement « 2 dimensions ».

### Rendu 2 — Plan caché ℝ² *(prototypé)*
- **Rôle :** cœur de la vidéo, la résolution du paradoxe.
- **Contenu :** plan 2D, chaque feature = flèche depuis l'origine (colonne de `W`), couleur par feature, **opacité ∝ ‖Wᵢ‖** (les non-représentées s'estompent au lieu de disparaître), cercle unité en pointillés, axes faibles, label d'indice.
- **Interaction :** piloté par le slider sparsité. Au scrubbing, les flèches se réorganisent en direct (digone → triangle → … → pentagone).
- **Acceptation :** à `n = 5`, en montant S de 0 à 0.95, on voit successivement 2, 3, 4, 5 flèches émerger ; le compteur « représentées / 2 » suit. Pas de tremblement parasite.

### Rendu 3 — Diagramme de phase de la perte (ajout)
- **Rôle :** respiration / vue d'ensemble du compromis.
- **Contenu :** courbe de perte qui décroît pendant l'entraînement (perte vs pas), plus un indicateur de convergence.
- **Interaction :** bouton « réentraîner depuis zéro » (reset Adam + W) pour montrer la convergence en direct ; bouton **pause / reprendre** pour figer l'état (utile au tournage). En pause, les pas Adam sont suspendus mais le rendu continue de refléter les changements de sliders/chips.
- **Acceptation :** la courbe décroît et se stabilise ; le reset relance visiblement une descente.

### Rendu 4 — Heatmap WᵀW *(prototypé)*
- **Rôle :** la preuve chiffrée de l'interférence.
- **Contenu :** grille `n×n`. Diagonale = représentation `‖Wᵢ‖²` en **or pâle** (`--rep`), bordure soulignée. Hors-diagonale = interférence : **ambre** (`--pos`) si positive, **sarcelle** (`--neg`) si négative ; magnitude → opacité, bornée `[−1, 1]`. Valeur numérique dans chaque case si l'espace le permet. Une **légende** compacte accompagne la grille (or = représentation, ambre = interf. +, sarcelle = interf. −).
- **Interaction :** synchronisée au même `S` que R2.
- **Acceptation :** quand un polygone s'organise dans R2, la heatmap se reconfigure simultanément ; les valeurs sont lisibles.

### Rendu 5 — Comparaison ReLU on/off *(prototypé)*
- **Rôle :** le moment décisif — la non-linéarité *est* le mécanisme.
- **Contenu :** soit un toggle global (prototype actuel), soit deux plans côte à côte (linéaire vs ReLU) avec leurs pertes respectives. **Préférence : la version côte à côte** pour l'évidence visuelle de l'asymétrie.
- **Interaction :** toggle / vue comparée.
- **Acceptation :** sans ReLU, le modèle reste sur 2 features orthogonales quelle que soit la sparsité ; avec ReLU, les polygones se déploient. L'écart de perte est affiché.

### Rendu 6 — Injection d'un vecteur creux *(prototypé)*
- **Rôle :** rendre l'interférence palpable.
- **Contenu :** chips de features pour composer `x` → barres d'entrée → point `h = Wx` dans un mini-plan ℝ² → barres de reconstruction `x̂`. Les features inactives portent des barres pointillées = **fantômes** d'interférence (positifs au-dessus, négatifs sous la ligne de base).
- **Interaction :** activer/désactiver des features ; observer les fantômes ; basculer ReLU.
- **Acceptation :** une seule feature active + ReLU ON → fantômes ≈ 0 ; ReLU OFF → fantômes apparaissent (signés) ; deux features qui se gênent dans la heatmap → fantôme qui grossit.

### Rendu 7 — Diagramme de phase importance × sparsité (ajout)
- **Rôle :** carte des régimes.
- **Contenu :** plan importance (y, log) × densité `1−S` (x, log). Trois régions colorées : non représentée / dimension dédiée / superposition. Classification par feature : `‖Wᵢ‖ ≈ 0` → non représentée ; `‖Wᵢ‖ ≈ 1` et interférences ≈ 0 → dédiée ; sinon → superposition. Un point déplaçable pilote en retour la sparsité globale.
- **Acceptation :** déplacer le point change le régime des autres rendus de façon cohérente.

### Rendu 8 — Remontée au modèle réel (ajout, stretch)
- **Rôle :** le pont vers les vrais transformers.
- **Contenu :** passer `m` de 2 à plus grand (3 → projection 3D Three.js, ou n grand projeté). Afficher la **dimensionnalité fractionnaire** des features (1/2 pour une paire antipodale, 2/3 pour un triangle…). Transition visuelle du pentagone 2D vers un nuage haute dimension.
- **Acceptation :** même mécanisme observable à m = 3 ; la dimensionnalité fractionnaire est affichée et correcte.

---

## 8. Contrôles et état global

État partagé (store) :
```ts
type ExplorerState = {
  n: number;            // 2..6, défaut 5
  S: number;            // 0..0.97, défaut 0.10
  r: number;            // 0.4..1, défaut 0.90
  useReLU: boolean;     // défaut true
  xin: number[];        // entrée R1/R6, longueur n
  W: number[][];        // 2 × n (publié par le moteur)
  b: number[];          // n
  loss: number;
  presenterRender: RenderId | null; // null = vue complète
};
```

Contrôles visibles (sobres, minimaux) : slider **sparsité** (dominant), slider **importance r**, sélecteur **n** (boutons 2–6), **toggle ReLU**, **boutons de presets**. Readout : « représentées / 2 », nom de géométrie, perte courante.

**Presets** (fixent n, S, r ensemble) :
| Label | n | S | r |
|---|---|---|---|
| Compression (2 orth.) | 5 | 0.05 | 0.85 |
| Antipodale n=2 | 2 | 0.90 | 0.90 |
| Triangle n=3 | 3 | 0.90 | 0.95 |
| Carré n=4 | 4 | 0.91 | 0.95 |
| Pentagone n=5 | 5 | 0.93 | 0.97 |

Les seuils S des presets sont **empiriques** : selon l'init aléatoire, le polygone peut mettre 1–2 s à se former. Acceptable ; ne pas chercher à forcer un état figé.

---

## 9. Design system

**Palette (tokens CSS) :**
```
--bg:#0d0e11   --panel:#14161b   --panel2:#191c22   --line:#2a2e37
--text:#c9c7be --dim:#7b7d82     --faint:#4a4d55
--rep:#d8b46a  (représentation — diagonale de WᵀW, or pâle)
--pos:#e0a64a  (interférence positive — hors-diagonale, ambre)
--neg:#4aa6a0  (interférence négative — hors-diagonale, sarcelle)
```

**Légende des couleurs (à respecter dans R4 et R6) :**
- **Diagonale de WᵀW = représentation `‖Wᵢ‖²`** → or pâle (`--rep`). Ce n'est *pas* une interférence : c'est à quel point la feature s'encode elle-même (idéalement ≈ 1).
- **Hors-diagonale = interférence `Wᵢ·Wⱼ`** : ambre (`--pos`) si positive (vecteurs proches, qui se renforcent), sarcelle (`--neg`) si négative (vecteurs opposés — celle que le ReLU rend gratuite).
- **Intensité (opacité) ∝ magnitude**, bornée `[−1, 1]`.

La distinction diagonale/hors-diagonale par la *teinte* (or pâle vs ambre) lève l'ambiguïté à l'écran : sans elle, représentation et interférence positive se confondraient. La diagonale reste en outre soulignée (bordure plus marquée).
Teintes features (jusqu'à 6, distinctes sur fond sombre) :
`#E0A64A #C9605A #6FA0C9 #84BE7E #B584C4 #D8C25A`.

**Typographie :** Fraunces (titres, serif caractériel), IBM Plex Mono (tous les chiffres, labels, axes — feel instrument), Spectral (prose). Charger via `@fontsource` ou Google Fonts. **Ne pas** utiliser Inter/Roboto/Arial/Space Grotesk.

**Lisibilité caméra (contraintes dures) :** traits ≥ 3 px à la résolution de tournage ; police de label ≥ ~11 px effectifs ; contrastes forts ; bascules entre rendus **franches, jamais en fondu**.

**Sobriété :** pas de dégradés flashy, pas de néons, pas d'animations décoratives. Les seules animations sont *fonctionnelles* (les flèches qui bougent parce que le modèle s'entraîne).

---

## 10. Performance et robustesse

- Frame de calcul < 8 ms ; rendu fluide à 60 fps.
- Aucune fuite : un seul `requestAnimationFrame` actif ; nettoyage au démontage.
- Pas de `NaN` : clamp/garde sur les divisions Adam (ε déjà présent) ; tester n=2 et n=6.
- Aucun usage de `localStorage`/`sessionStorage` (inutile ici, et proscrit dans certains environnements d'artifact).

---

## 11. Mode présentation (pour le tournage)

Exigence spécifique au contexte vidéo : pouvoir **isoler un rendu plein écran**. La vue par défaut montre l'ensemble (R2 + R4 + contrôles + R6), mais pour filmer, le présentateur doit pouvoir cliquer un rendu pour l'afficher seul, en grand, contrôles minimaux. Raison pédagogique (règle des trois minutes) : ne pas laisser cinq graphiques animés se disputer l'attention pendant qu'on explique un point précis.

- Raccourcis clavier `1`–`8` → isole le rendu correspondant ; `0` ou `Échap` → vue complète.
- **Barre d'espace → pause / reprendre l'entraînement** : fige l'état (plus de respiration stochastique) pour filmer un plan stable ou commenter sans que vecteurs et chiffres bougent. Le rendu reste réactif aux sliders et chips même en pause (seuls les pas Adam sont suspendus).
- En mode isolé, garder uniquement le(s) contrôle(s) pertinent(s) pour ce rendu.
- Transitions franches (cut), pas de fondu.

---

## 12. Définition de « terminé »

1. `engine/` testé isolément : `model.ts` produit un forward correct ; `train.ts` fait décroître la perte sur un cas connu.
2. Les 4 rendus prototypés reproduisent le comportement du fichier de référence sans régression numérique.
3. Les rendus 1, 3, 7 ajoutés et conformes à leurs critères d'acceptation. R8 livré ou explicitement marqué stretch.
4. Mode présentation fonctionnel (raccourcis 1–8, isolement, cuts francs).
5. Design system appliqué (tokens, fonts, lisibilité caméra).
6. `npm run dev` démarre sans erreur ; `npm run build` produit un bundle statique servable.
7. README court : comment lancer, comment piloter pendant un tournage.

---

## 13. Étapes suggérées (milestones)

1. **M1 — Squelette + moteur.** Vite/React/TS, port de `engine/` depuis le prototype, store, boucle rAF, readout. Vérifier que la perte décroît.
2. **M2 — Rendus prototypés.** Porter R2, R4, R5, R6 en composants ; parité comportementale avec la référence.
3. **M3 — Rendus ajoutés.** R1, R3, R7.
4. **M4 — Mode présentation + design system + lisibilité caméra.**
5. **M5 — R8 (stretch) + polish + README.**

---

## Annexe A — Gradients manuels (par échantillon)

Pour un échantillon `x` (notations : `h = Wx`, `z_i = b_i + Σ_a W[a][i]·h_a`, `x̂_i = ReLU(z_i)`) :
```
g_i      = 2 · I_i · (x̂_i − x_i) · [z_i > 0]      // dL/dz_i ; [·]=1 si ReLU OFF
grad_b_i += g_i
dh_a      = Σ_i g_i · W[a][i]
grad_W[a][i] += g_i · h_a  +  dh_a · x_i
```
Moyenner sur le batch, puis pas Adam standard. (Version validée dans le prototype.)

## Annexe B — Cas géométriques attendus (m = 2)

| n | sparsité | géométrie attendue | dimensionnalité/feature |
|---|---|---|---|
| 5 | faible | 2 features orthogonales, 3 à zéro | 1 (les 2 actives) |
| 2 | élevée | paire antipodale (digone) | 1/2 |
| 3 | élevée | triangle (120°) | 2/3 |
| 4 | élevée | carré / deux paires antipodales | — |
| 5 | élevée | pentagone | — |

Ces formes sont le test visuel de correction : si le moteur est juste, elles émergent sans être codées en dur.
