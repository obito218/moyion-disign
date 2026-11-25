# Audit CRO MURELLE — 25 novembre 2026

Périmètre : thème « Horizon – Gammes » (non publié), données Shopify en direct. Aucune modification effectuée.
Méthode : captures Shopify ordinateur (1440 px) et mobile (390 px) ; lecture du code du thème ; requêtes Admin API ; test du vrai script du configurateur dans Chromium (réplique du balisage, réglages réels).
Étiquettes : **[observé]** capture, **[mesuré]** code/API/test, **[supposé]** heuristique (confiance indiquée).
Aucun chiffre de conversion : aucune donnée de trafic ni de vente n'est disponible.

## Notes par axe (sur 10)
| Axe | Note | Justification |
|---|---|---|
| Conversion | 3 | 19 produits sur 24 sans image, paiement inactif, champs de dimensions ambigus, prix affiché sans « / m² » |
| Design / direction artistique | 7 | Identité cohérente là où il y a des visuels ; cartes vides et grilles grises la dégradent |
| Technique / SEO / accessibilité | 5 | JSON-LD Product présent, un h1 par page ; descriptions identiques sur 24 produits, meta description de la boutique vide, bouton « Submit » en anglais |
| Honnêteté / confiance | 3 | Mention « Visualisation » et calcul transparents ; mais aucune CGV, délais non confirmés, livraison « express » affichée alors que les tarifs s'appellent « Standard » |
| **Global** | **4** | Bonne base produit (gammes, configurateur) ; pas prête pour du trafic payant |

## Constats classés par priorité

### P1 — Bloquants avant toute dépense publicitaire
| # | Problème | Preuve | Pourquoi ça coûte des ventes | Solution | Impact | Difficulté |
|---|---|---|---|---|---|---|
| 1 | Aucun moyen de paiement ; thème non publié ; pas de nom de domaine | [mesuré] `paymentSettings` vide, domaine `cdskau-zu.myshopify.com` | Aucune vente possible ; adresse myshopify = boutique non sérieuse | Activer Shopify Payments + PayPal, publier « Horizon – Gammes », acheter et connecter le domaine | Bloquant | Faible (admin, toi) |
| 2 | 19 produits sur 24 sans aucune image mais en vente | [mesuré] `mediaCount = 0` ; [observé] fiche « Sous-bois lumineux » sans galerie, accueil « Nos motifs du moment » = 6 cartes grises (≈ 1 900 px de vide sur mobile), collections Tropical (5/5) et Chambre d'enfant (6/6) entièrement grises, « Autres motifs » = 4 cartes vides sur chaque fiche | On ne vend pas un papier peint invisible ; un visiteur Ads voit un site inachevé et repart ; Shopping refuse les produits sans image | Passer ces 19 produits en brouillon (ou hors canal Boutique en ligne) jusqu'à leurs visuels ; mettre dans « Nos motifs du moment » uniquement des produits illustrés ; retirer Tropical et Chambre d'enfant du menu et de « Quatre univers » tant qu'ils sont vides ; faire pointer « Autres motifs » vers des produits illustrés | Très fort | Faible |
| 3 | Pages légales et de confiance absentes | [mesuré] seule la politique de confidentialité existe ; pied de page sans aucun lien (newsletter, copyright, « Conditions générales et politiques ») ; [observé] page Contact = formulaire nu, bouton « Submit » en anglais, ni e-mail, ni téléphone, ni délai de réponse ; adresse de contact Gmail | Achat de 400–500 € sans CGV, conditions de retour, livraison ni identité du vendeur : frein majeur, et motif fréquent de suspension Merchant Center (« représentation trompeuse ») ; obligations légales (mentions légales, CGV, exclusion de rétractation du sur-mesure, art. L221-28 3° C. conso.) | Rédiger CGV, livraison, retours, mentions légales, coordonnées ; menu de pied de page (Livraison, Retours, CGV, Mentions légales, FAQ, Contact) ; page Contact avec texte d'accueil, e-mail à ton domaine, délai de réponse ; traduire « Submit » | Fort | Faible à moyenne |
| 4 | Promesses de délai non vérifiées et incohérentes | [observé] « Production en 3 à 5 jours · Livraison express » dans le bandeau, la fiche, la FAQ, la réassurance ; [mesuré] tarifs France nommés « Standard » (0 € et 8,80 €, conditions inconnues) | Le client lit « express » et voit « Standard » au paiement : perte de confiance au dernier moment ; promesse non tenue = litiges et risque Merchant Center | Faire confirmer délai de production et transporteur par le fournisseur ; écrire partout la même formule exacte (« expédié sous X jours ouvrés, livré en Y–Z jours ») ; renommer les tarifs ; afficher le coût de livraison près du bouton d'achat | Fort | Faible |
| 5 | Quantité modifiable dans le panier pour un produit sur mesure | [mesuré] `snippets/cart-products.liquid` affiche le sélecteur de quantité sur chaque ligne ; le masquage n'existe que sur la fiche (`murelle.css` l. 30-31) | La quantité = m² facturés : passer de 13 à 1 fait payer 45 € pour un mur de 13 m², les dimensions restant dans la commande ; « 13 » se lit aussi comme « 13 rouleaux » | Masquer le sélecteur pour les lignes qui ont une dimension ; afficher « 13 m² » et un lien « Modifier les dimensions » vers la fiche (`?largeur=&hauteur=`) | Moyen à fort (fiabilité des commandes) | Faible |
| 6 | Bouton « Acheter maintenant » | [observé] deux boutons pleins de même poids ; [supposé, confiance moyenne] les champs de dimensions sont reliés au formulaire par l'attribut `form` et non placés dedans : rien ne garantit que le paiement accéléré les transmet | Si les dimensions ne suivent pas, la commande est inexploitable ; deux appels à l'action concurrents | Dès que le paiement est actif : passer une commande test par ce bouton et vérifier les dimensions dans la commande ; si elles manquent, retirer le bloc de la fiche (le garder dans le panier) | Fort si défaillant | Faible |

### P2 — Fort levier de conversion
| # | Problème | Preuve | Pourquoi | Solution | Impact | Difficulté |
|---|---|---|---|---|---|---|
| 7 | Champs de dimensions trompeurs | [observé] « 320 » et « 250 » s'affichent comme des valeurs saisies alors que ce sont des exemples ; le total reste « — » ; [mesuré] vide → blocage avec la bulle du navigateur seulement ; 320,5 cm → prix affiché mais ajout bloqué ; limites (50–2000 / 50–500 cm) jamais indiquées | Étape centrale du parcours : l'incompréhension se termine en abandon | Exemples visiblement grisés (« ex. 320 ») ; aide sous les champs (« entre 50 et 2 000 cm ») ; message d'erreur en ligne ; accepter les décimales ou arrondir ; afficher un exemple chiffré avant saisie | Fort | Faible |
| 8 | Prix sans unité sur les cartes et la fiche | [observé] « €37,00 » sur l'accueil et les collections, « €45,00 » en tête de fiche ; le panier réel est de 370 à 530 € pour un mur type | Ancrage faux : choc de prix au configurateur ; clics Shopping non qualifiés | « à partir de 37 € / m² » partout ; ligne d'exemple « ≈ 450 € pour un mur de 3,20 × 2,50 m en Signature » ; prix unitaire au m² dans Merchant Center | Fort | Faible à moyenne |
| 9 | Fiche produit pauvre en informations | [mesuré] description identique sur les 24 produits ; aucune caractéristique technique, aucun lien « mesurer », « poser », « livraison », « retours » sur la fiche ; la notice de pose existe dans le dépôt mais n'est pas publiée | Les objections (pose, colle, entretien, pièce humide, délai, retour) restent sans réponse au moment de décider | Accordéons « Bon à savoir » sous le bouton : Matières et finitions, Mesurer son mur, Pose (lien notice), Livraison et retours ; description propre à chaque motif ; caractéristiques seulement après validation fournisseur | Fort | Moyenne |
| 10 | Galerie hétérogène | [mesuré] images de 765 à 1 536 px, formats mélangés (1,16 à 1,62) ; [observé] bandes et grille désalignée (Ondes Terracotta) ; visuels générés dont le motif et la couleur diffèrent du fichier à plat | Le visuel fait la vente en déco ; un écart de couleur crée des retours et des litiges | 2 000 px, format unique 3:2, au moins une vue rapprochée de la texture imprimée réelle, motif à plat fidèle, mention « Visualisation » conservée | Moyen à fort | Moyenne (contenu) |
| 11 | Gammes bien conçues mais longues sur mobile | [observé] 3 cartes détaillées repoussent le bouton d'achat à environ 2 300 px sur mobile (Ondes Terracotta) ; écarts de finition décrits par des termes vagues ; Essentielle présélectionnée alors que Signature est recommandée | Effort de lecture avant le choix ; différence de valeur entre gammes peu tangible | Version compacte sur mobile (texte repliable) ; une ligne « idéal pour… » par gamme, une fois validée par le fournisseur ; tester Signature présélectionnée | Moyen | Faible à moyenne |
| 12 | Pas d'échantillon | [observé] aucune offre | Pour 450 € sur la foi d'une image écran, l'échantillon réduit le risque perçu et sert d'étape de conversion intermédiaire | Échantillon payant (format A4) si le fournisseur le permet | Potentiellement fort [supposé, confiance moyenne] | Moyenne |
| 13 | Mobile : pas de récapitulatif persistant | [observé] le total et le bouton ne sont visibles qu'en bas du configurateur | Sur mobile, l'utilisateur perd le total en remontant voir les images | Barre fixe « Total · Ajouter au panier » une fois les dimensions valides | Moyen | Moyenne |

### P3 — Finitions
| # | Problème | Preuve | Solution | Impact | Difficulté |
|---|---|---|---|---|---|
| 14 | Format de prix incohérent : « €45,00 » et « 585,00 € » | [observé] | Paramètres → Général → format de devise `{{amount_with_comma_separator}} €` | Faible | Très faible |
| 15 | Pied de page : « propulsé par Shopify » ; réseaux sociaux paramétrés vers les pages d'accueil génériques (facebook.com…) | [mesuré] réglages du pied de page | Retirer la mention, vider ou renseigner les vrais comptes | Faible | Très faible |
| 16 | Accroche de l'accueil vague | [observé] « Des papiers peints panoramiques pensés pour transformer votre intérieur. » | Dire ce qui est vendu : « imprimé sur mesure, prix au m², livré en France » | Moyen (recherches de marque) | Très faible |
| 17 | SEO de base | [mesuré] description de boutique vide ; titres et descriptions SEO produits vides (descriptions identiques reprises) | Renseigner par motif après la refonte des descriptions | Faible à court terme | Faible |
| 18 | Navigation sans aide | [observé] menu : 4 univers, Tous les motifs, Contact | Ajouter « Comment ça marche » (mesure, gammes, pose, livraison) | Moyen | Faible |

## Configurateur : test du vrai script
| Largeur × hauteur | Lés | Facturé | Total affiché (Signature) | Ajout au panier |
|---|---|---|---|---|
| vide | — | — | — | bloqué (bulle du navigateur) |
| 0, −320, 49 × 250 | — | — | — | bloqué (minimum 50) |
| 50 × 50 | 2 | 1 m² | 45 € | ajouté (1 m²) |
| 320 × 250 | 7 | 10 m² | 450 € | ajouté (10 m²) |
| 320,5 × 250 | 7 | 10 m² | 450 € | **bloqué** (pas de décimale) alors que le prix s'affiche |
| 400 × 270 | 9 | 13 m² | 585 € | ajouté |
| 2000 × 500 | 41 | 105 m² | 4 725 € | ajouté |
| 2001 × 250, 320 × 501 | — | — | — | bloqué (maximum) |
Calcul exact dans tous les cas (total = m² facturés × prix de la gamme ; cartes 370 / 450 / 530 € pour 320 × 250). Aucune erreur JavaScript. Minimum facturé de 1 m² (45 €) : rentabilité à valider avec le fournisseur et les frais de port.

## Non mesuré (et données nécessaires)
- Taux de conversion, rebond, abandon : aucune statistique (Shopify Analytics vide, pas de GA4).
- Core Web Vitals / Lighthouse : la boutique n'est pas joignable depuis l'environnement de travail.
- Paiement et checkout : impossible sans moyen de paiement actif.
- Tiroir panier avec articles, paiement accéléré : l'outil de capture ne clique pas.
- Bannière de consentement, balises de suivi (Google Ads, GA4) : non vérifiables par l'API utilisée.
- Contrastes et cibles tactiles mesurés dans le DOM : pas de navigateur sur la boutique réelle.
À collecter dès le lancement : GA4 + conversions Google Ads, enregistrements de sessions (Microsoft Clarity, gratuit) sur fiche et panier.

## Les 5 chantiers avant Google Ads
1. **Encaisser** : paiements, thème publié, domaine ; commande test réelle de bout en bout, y compris « Acheter maintenant ». Test : la commande contient gamme, largeur, hauteur, lés, surface, et le montant attendu.
2. **Ne montrer que ce qui est prêt** : 19 produits sans image hors boutique ; accueil, menu, « Quatre univers », « Autres motifs » sans carte vide. Test : aucune carte grise sur accueil, collections, fiches (mobile et ordinateur).
3. **Confiance et légal** : CGV, livraison, retours, mentions légales, contact complet, pied de page, délais confirmés et identiques partout. Test : les 5 liens au pied de page ; une seule formule de délai sur le site et au checkout.
4. **Prix et dimensions compris d'un coup d'œil** : « à partir de … € / m² », exemple chiffré, champs sans ambiguïté avec limites et erreurs en ligne. Test : un proche non prévenu trouve le prix de son mur en moins d'une minute sur mobile.
5. **Panier fiable et fiche qui répond aux objections** : quantité verrouillée, lien « Modifier les dimensions », accordéons Mesure / Pose / Livraison et retours. Test : impossible de changer les m² dans le panier ; chaque objection a une réponse visible sans quitter la fiche.
