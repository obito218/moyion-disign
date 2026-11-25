# MURELLE — Recherche de compétences (Skills, MCP, outils)

Date : 25 novembre 2026. Rien n'a été installé pendant cette recherche. Aucune modification du site.

## 0. Vocabulaire (ce qui est quoi)

| Type | Ce que c'est | Exemple pour MURELLE | Risque principal |
|---|---|---|---|
| **Skill** | Dossier avec un `SKILL.md` : un mode d'emploi que Claude charge quand la tâche le demande. Peut contenir des scripts. | `google-ads-papier-peint` | Instructions piégées (injection), scripts inconnus |
| **Plugin** | Paquet qui regroupe skills, commandes, agents, hooks et parfois des serveurs MCP. | Shopify AI Toolkit | Hooks exécutés automatiquement, télémétrie |
| **MCP / connecteur** | Accès en direct à un service externe (lecture, parfois écriture). | Connecteur Shopify (actif), Google Ads MCP | Accès aux données du compte, actions sur le compte |
| **Bibliothèque / outil** | Code ou logiciel classique utilisé par Claude ou par toi. | OpenCV, Theme Check, Lighthouse CI | Dépendances à maintenir |

Une skill ne rend pas Claude « plus intelligent » durablement : elle n'agit que quand elle est chargée. Ce qui persiste d'une conversation à l'autre : les skills, `CLAUDE.md`, et les fichiers du dépôt (ce document, `COMPTE-RENDU.md`).

## 1. Audit du projet (ce qui a été réellement inspecté)

**Inspecté** : le dépôt `obito218/moyion-disign`, le thème Shopify « Horizon – Gammes » (via le connecteur Shopify), les données produits/collections/politiques/livraison (API Admin), les skills et plugins disponibles sur ton compte.
**Non mesuré** : performances réelles (Core Web Vitals), car la boutique n'est pas joignable depuis l'environnement de travail ; apps Shopify installées ; paramètres de la bannière de consentement.

### Structure
- **Dépôt GitHub** : documentation et visuels (`murelle/COMPTE-RENDU.md`, `notice-de-pose/`, `visuels/`, `identite/`, `familles-de-motifs.md`), copies de quelques fichiers du thème (`murelle/theme/`), `CLAUDE.md`. **Le thème lui-même n'est pas versionné dans Git** : il n'existe que sur Shopify.
- **Thème** : Horizon 3.2.1 (49 sections, 96 blocs, 100 snippets, 119 assets) + 20 fichiers MURELLE (sections hero, bannière collection, galerie, matières, estimation, FAQ, mur ; blocs configurateur et choix du motif ; snippets gammes, panier, réassurance, logos de paiement).
- **Technologies** : Liquid (Online Store 2.0, theme blocks), JavaScript natif en custom elements (configurateur 5,7 Ko, motifs 3,9 Ko, estimation 1,9 Ko, reveal 0,8 Ko), CSS `murelle.css` 43 Ko non minifié, métaobjets (`famille_motifs`), métachamps (`murelle.miniature_motif`), API Admin GraphQL 2026-10.
- **Fonctions présentes** : 3 gammes (cartes), configurateur de dimensions (lés, surface facturée, quantité = m², propriétés de ligne), panier affichant la gamme, réassurance panier, logos de paiement (masqués tant qu'aucun paiement n'est actif), hero immersif, bannières de collection, familles de motifs, guide de pose (dans le dépôt).

### Points faibles vérifiés
1. **Aucun moyen de paiement actif** : la boutique ne peut pas encaisser.
2. **Thème non publié** ; **pas de nom de domaine** (adresse `myshopify.com`).
3. **Politiques légales absentes** : seule la politique de confidentialité existe (pas de CGV, retours, livraison, coordonnées, mentions légales).
4. **19 produits sur 24 sans image** ; plusieurs images à 780 px (Ondes Terracotta, Ondes Sauge, 3ᵉ image Élégance Botanique).
5. **Prix affiché « 37,00 € » sans « / m² »** sur les cartes produits : ancrage trompeur pour un achat de 370 à 530 €.
6. **Section « Autres motifs »** : cartes vides sur chaque fiche (elle propose des produits sans image).
7. **Configurateur vide à l'arrivée** : aucun total affiché tant que le client n'a rien saisi.
8. **Carrousel mobile** : bandes crème quand une image verticale se mêle aux horizontales.
9. **Bandeau « Production en 3 à 5 jours · Livraison express »** : promesse non vérifiée auprès du fournisseur.
10. **Fichiers cœur d'Horizon modifiés** (`snippets/variant-main-picker.liquid`, `blocks/variant-picker.liquid`, `snippets/cart-products.liquid`, `snippets/cart-summary.liquid`, `config/settings_schema.json`) : chaque mise à jour d'Horizon demandera de reporter ces modifications à la main.
11. **Trois grilles de prix** en circulation (37/45/53 sur Shopify, 39/49/59 dans le brief, 29/39/52 dans la skill Google Ads).

### Tâches répétitives observées (candidates à l'automatisation)
- Ajouter un motif : dupliquer le produit modèle, importer et ordonner les images, textes alternatifs, collection, étiquettes, famille, miniature, vérification. Fait 4 fois à la main, avec les mêmes pièges (collection « Page d'accueil » héritée, suffixe ajouté par Shopify aux noms de fichiers, API renommées).
- Préparer les images : contrôle de résolution, format, nommage, texte alternatif.
- Tenir `COMPTE-RENDU.md` à jour.

## 2. Ce qui existe déjà sur ton compte

| Élément | Type | Statut | Verdict |
|---|---|---|---|
| Connecteur Shopify + skills `admin-graphql`, `editing-themes` | MCP officiel Shopify | Actif, utilisé pour tout le travail sur le site | **Garder** |
| `google-ads-papier-peint` | Skill personnelle | Active | **Garder, mettre à jour** (prix et état réel faux) |
| `audit-site-conversion` | Skill personnelle | Active | **Garder** |
| `skill-creator`, `deep-research`, `pdf`, `docs`… | Skills Anthropic | Actives | Utiles ponctuellement |

## 3. Candidats trouvés et classement

### ESSENTIEL

| Nom | Source | Utilité pour MURELLE | Fiabilité | Risques / permissions |
|---|---|---|---|---|
| **murelle-catalogue** (à créer) | Ce projet | Ajout et mise à jour de motifs selon nos règles, sans oublier une étape | Élevée : écrite à partir de ce qui a marché ici | Aucune dépendance externe ; écrit sur Shopify via le connecteur existant |
| **murelle-visuels** (à créer) | Ce projet + OpenCV (bibliothèque libre) | Mises en situation par incrustation en perspective du motif réel, sans le redessiner ; contrôle qualité des images | Méthode standard (homographie) ; à valider sur tes photos | Installer `opencv-python-headless` dans l'environnement |
| **google-ads-papier-peint** (mise à jour) | Ta skill | Chiffres et état réels, prix au m² dans Shopping, flux limité aux produits illustrés | Élevée | Aucune |
| **Thème versionné dans GitHub** (intégration officielle Shopify) + Theme Check | Shopify | Historique, comparaison avant/après, mises à jour d'Horizon maîtrisées, contrôle du Liquid | Officiel | Connexion GitHub ↔ Shopify à faire par toi |
| **Google Ads MCP** (`googleads/google-ads-mcp`) | Google, open source | Lire campagnes, termes de recherche, conversions, dès qu'il y a des données | Officiel ; lancé en lecture seule (oct. 2025) | OAuth Google Ads ; à brancher après le lancement |

### UTILE

| Nom | Source | Utilité | Réserve |
|---|---|---|---|
| **Shopify AI Toolkit** | Shopify (plugin officiel) | Documentation à jour, validation du Liquid et du GraphQL avant mise en ligne | En partie redondant avec le connecteur actif. **Télémétrie active par défaut** : envoie la requête, le code validé et jusqu'à 2 000 caractères de ton dernier message à `shopify.dev/mcp/usage` → désactiver avant usage |
| **Google Analytics MCP** (`googleanalytics/google-analytics-mcp`) | Google | Lire GA4 (lecture seule) | Après le lancement ; dépôt non ouvert directement, à vérifier |
| **Merchant API MCP** | Google (alpha) | Diagnostics Merchant Center, produits refusés | Alpha : pas pour la production |
| **marketingskills** — uniquement `cro`, `conversion-tracking`, `ab-testing`, `schema` | coreyhaines31 (MIT, communauté, très suivi) | Grilles CRO, plan de suivi des conversions, tests A/B, données structurées | Copier à la main les fichiers relus, pas d'installation globale (dossiers `scripts/` et `tools/` non vérifiés) |
| **frontend-design**, **webapp-testing** | `anthropics/skills` (officiel, Apache 2.0) | Qualité des interfaces ; tests automatiques du parcours d'achat (Playwright) | Fournis « à des fins de démonstration » ; le test de parcours exige que la boutique soit joignable |
| **Marketing** (plugin) | Anthropic | Revue de marque, audit SEO, rapports | Embarque beaucoup de connecteurs inutiles ici (Ahrefs, Canva, Figma, HubSpot…) |
| **Lighthouse CI** (`Shopify/lighthouse-ci-action`) | Shopify | Mesure automatique des performances à chaque modification du thème | Nécessite le thème dans GitHub ; dépôt peu actif |

### À ÉVITER (pour l'instant)

| Nom | Pourquoi |
|---|---|
| **claude-ads** (AgriciDaniel) | Paquet Python + Playwright + script d'installation, statut « development candidate », 12 plateformes : lourd et redondant avec ta skill + le MCP officiel Google Ads |
| **claude-seo** (AgriciDaniel) | Scripts, hooks, Chromium installé localement ; une version de `seo-technical` notée « Critical: do not install without reviewing » par Tessl ; 29 sous-skills pour 24 produits |
| **Plugins pub tiers** (Windsor.ai, Supermetrics, AdWhispr, AdCopilot, Ryze, Hyper, Trackian, dataslayer) | Tes données publicitaires passent par leurs serveurs, certains peuvent modifier budgets et campagnes ; inutiles sans compte Ads actif. Supermetrics ou Windsor.ai (partenaires vérifiés) à reconsidérer si tu multiplies les canaux |
| **SEO-AEO-GEO Ultimate** | 27 skills communautaires qui se chevauchent |
| **Génération d'images de motifs par IA** | Contraire à la règle : le motif fournisseur doit rester exact. L'IA n'est acceptable que pour la pièce, jamais pour le motif |
| **Collections « awesome » / installations en masse** | Études 2026 (préprints) : sur ~31 000 skills, 26,1 % ont au moins une vulnérabilité ; 157 skills malveillantes confirmées sur ~98 000 |

## 4. Plan d'action

### A. Les 10 compétences les plus utiles, par priorité
1. murelle-catalogue (à créer)
2. murelle-visuels (à créer)
3. google-ads-papier-peint (mise à jour)
4. Connecteur Shopify + skills officielles (déjà actif)
5. Thème dans GitHub + Theme Check
6. audit-site-conversion enrichie (grille CRO, objections du sur-mesure)
7. Google Ads MCP officiel (après lancement)
8. Google Analytics MCP officiel (après lancement)
9. Shopify AI Toolkit (sur ton Mac, télémétrie coupée)
10. webapp-testing (test automatique du parcours d'achat)

### B. Les 3 premiers
1. **murelle-catalogue** : 19 produits attendent leurs images ; chaque ajout manuel répète une dizaine d'étapes et les mêmes pièges.
2. **murelle-visuels** : les images sont le premier frein (vente et Google Shopping) ; la règle de fidélité du motif exige une méthode d'incrustation, pas de génération.
3. **google-ads-papier-peint à jour** : ses prix et son état sont faux ; c'est elle qui guidera chaque euro dépensé.

Aucune ne demande de code tiers.

### C. Installations proposées (en attente de ton accord)
| # | Quoi | Où | Commande / action | Permissions |
|---|---|---|---|---|
| 1 | Créer `murelle-catalogue` et `murelle-visuels` | Dépôt, `.claude/skills/` | Écriture de fichiers + commit | Aucune nouvelle |
| 2 | Mettre à jour `google-ads-papier-peint` | Ton compte claude.ai | Je rédige le nouveau `SKILL.md`, tu le téléverses | Aucune |
| 3 | OpenCV | Environnement de travail | `pip install opencv-python-headless` | Réseau vers PyPI (déjà autorisé) |
| 4 | Thème ↔ GitHub | Admin Shopify | Boutique en ligne → Thèmes → Ajouter un thème → Connecter depuis GitHub | Accès de Shopify à un dépôt GitHub |
| 5 | Shopify AI Toolkit | Ton Mac | `mkdir -p ~/.config/shopify-ai-toolkit && touch ~/.config/shopify-ai-toolkit/opt-out` puis `claude plugin install shopify-ai-toolkit@claude-plugins-official` | Node 18+, accès réseau shopify.dev |
| 6 | Google Ads MCP (après lancement) | Ton Mac | `pipx run --spec git+https://github.com/googleads/google-ads-mcp.git google-ads-mcp` + configuration OAuth | Lecture du compte Google Ads |

### D. Ce que ça peut changer
- **Catalogue** : un motif ajouté en une demande, toujours avec le même niveau de contrôle ; moins d'erreurs (collection héritée, ordre des images).
- **Visuels** : mises en situation crédibles qui montrent le vrai motif ; fiches complètes, éligibles à Google Shopping.
- **Google Ads** : décisions calculées sur tes vrais coûts ; flux limité aux produits prêts ; prix affiché au m².
- **Maintenance** : chaque modification du thème est historisée et vérifiable ; mises à jour d'Horizon sans casse.
Aucune de ces mesures ne garantit une baisse du coût par clic ou une hausse de conversion : elles retirent des freins mesurables et rendent les résultats lisibles.

### E. Stratégie d'évolution
1. **Mémoire persistante** : `CLAUDE.md` (règles permanentes), skills versionnées dans `.claude/skills/`, `COMPTE-RENDU.md` (journal), ce fichier (registre des outils).
2. **Retour d'expérience** : après chaque mission, une ligne ajoutée à la skill concernée (piège rencontré, correction).
3. **Veille mensuelle** : relire les changements de Shopify (changelog, versions d'Horizon), de Claude Code, de Google Ads / Merchant Center ; mettre à jour ce registre avec la date de vérification.
4. **Règle de sécurité** : aucune installation sans lecture des fichiers, version fixée (commit), télémétrie coupée, permissions minimales.
5. **Mesure** : une fois le site en ligne, relier chaque changement à un indicateur (taux d'ajout au panier, conversion, coût par vente, score Lighthouse).

## Sources
- Anthropic Agent Skills : https://github.com/anthropics/skills — standard : https://github.com/agentskills/agentskills
- Shopify AI Toolkit : https://shopify.dev/docs/api/ai-toolkit — https://github.com/Shopify/Shopify-AI-Toolkit — https://shopify.dev/changelog/blog/shopify-ai-toolkit-connect-your-ai-tools-to-the-shopify-platform
- Google Ads MCP : https://github.com/googleads/google-ads-mcp — https://developers.google.com/google-ads/api/docs/developer-toolkit/mcp-server — https://developers.google.com/ads/blog/posts/2025/10/open-source-google-ads-api-mcp-server
- Google Analytics MCP : https://pypi.org/project/google-analytics-mcp/
- Merchant API MCP (alpha) : https://developers.google.com/merchant/api/guides/agentic-tools/merchant-data-mcp
- Prix unitaire Merchant Center : https://support.google.com/merchants/answer/6324455 — https://support.google.com/merchants/answer/6324490
- claude-ads : https://github.com/AgriciDaniel/claude-ads — claude-seo : https://github.com/AgricIDaniel/claude-seo — évaluation Tessl : https://tessl.io/registry/skills/github/AgriciDaniel/claude-seo/seo-ecommerce/security
- marketingskills : https://github.com/coreyhaines31/marketingskills
- Lighthouse CI Shopify : https://github.com/Shopify/lighthouse-ci-action — https://shopify.dev/docs/storefronts/themes/tools/lighthouse-ci — Theme Check : https://shopify.dev/docs/storefronts/themes/best-practices/performance/theme-check-tool
- Homographie (incrustation en perspective) : https://learnopencv.com/homography-examples-using-opencv-python-c
- Sécurité des skills (préprints) : https://arxiv.org/html/2601.10338 — https://arxiv.org/pdf/2602.06547 — https://arxiv.org/pdf/2602.20156v3
- Catalogue de plugins consulté : Anthropic Directory (via la recherche de plugins du compte)

## 5. Réalisé le 25/11/2026 (avec ton accord « vas-y » sur les points 1, 2, 3)
- **Skill `murelle-catalogue`** créée : `.claude/skills/murelle-catalogue/SKILL.md` (procédures nouveau motif, remplacement d'image, famille, vérifications, références et pièges).
- **Skill `murelle-visuels`** créée : `.claude/skills/murelle-visuels/` avec `controle_images.py` (contrôle qualité d'un lot), `incruster_motif.py` (incrustation en perspective du motif réel, masque, éclairage, contrôle de fidélité) et `test_incrustation.py` (4 tests : fidélité 0,998, objets masqués et hors-mur inchangés, ordre de coins erroné détecté — tous passent).
- **OpenCV** installé dans l'environnement de travail (`opencv-python-headless` 5.1.0). À réinstaller dans une nouvelle session si absent.
- **Skill `google-ads-papier-peint` mise à jour** : `murelle/skills-compte/google-ads-papier-peint/SKILL.md` (+ `.zip`) — à téléverser sur ton compte claude.ai pour remplacer l'ancienne version (je ne peux pas modifier les skills du compte moi-même).
- Non fait (attend ton action) : thème ↔ GitHub, Shopify AI Toolkit, Google Ads MCP.
