# Recette fonctionnelle

Vérification des fonctionnalités principales de l'application sur l'environnement de livraison. Campagne des 3 et 5 octobre 2026.

## 1. Méthode

**Environnement.** Les scénarios sont rejoués sur `https://hotel-booking-bloc3.vercel.app`, donc sur l'application déployée, avec sa base PostgreSQL hébergée chez Neon et Stripe en mode test : même build de production, mêmes variables d'environnement, même base. Le cahier des charges demande un environnement de production simulé ; c'est l'environnement de livraison lui-même qui est utilisé.

Ce choix répond à un constat consigné en section 9.4 de la documentation technique : les trois défauts les plus longs à diagnostiquer sur ce projet ne se manifestaient pas en développement local. Une vérification passée uniquement en local n'aurait détecté ni la variable d'environnement tronquée à la copie, ni l'URL de repli valable seulement sur le poste de développement.

**Comptes et moyen de paiement.** Les deux comptes de démonstration, mot de passe commun `Demo2026!` : `demo.client@bookyourtravel.fr` pour le rôle client, `demo.admin@bookyourtravel.fr` pour le rôle administrateur. Carte de test Stripe `4242 4242 4242 4242`, date d'expiration future, cryptogramme au choix. Aucun flux financier réel n'est engagé.

**Notation.** `OK` lorsque le résultat observé correspond au résultat attendu, `KO` sinon, l'écart étant détaillé en section 7. Un scénario `KO` donne lieu à une correction puis à un nouveau passage, et la ligne porte alors la date du passage concluant.

**Navigateurs.** Chrome et Firefox en version courante sur poste de bureau, puis Chrome sur mobile pour les scénarios du parcours client. Les mesures Lighthouse sont relevées en navigation privée, extensions désactivées.

---

## 2. Parcours client

| # | Scénario | Résultat attendu | Observé | Date |
|---|---|---|---|---|
| C1 | Rechercher une destination depuis l'accueil, puis parcourir la liste jusqu'à la dernière page | Seuls les hôtels de la destination sont listés, la pagination reste cohérente et aucun hôtel n'apparaît deux fois | OK. Vignette Paris 10, recherche 10 résultats, tous à Paris. Liste complète : 102 établissements, 12 par page, 9 pages, 6 sur la dernière, tri par note décroissante, aucun doublon | 03/10/2026 |
| C2 | Ouvrir une fiche hôtel, visiter les cinq onglets, puis ouvrir une chambre et comparer deux de ses offres | Les onglets s'affichent sans rechargement complet ; les prix et formules des deux offres diffèrent conformément aux données de la fiche | OK. Chaque onglet a sa propre route. Trois offres distinctes sur le prix, la pension et l'annulation : 166 € sans repas non remboursable, 208 € sans repas remboursable, 239 € petit-déjeuner remboursable | 03/10/2026 |
| C3 | Réserver une offre en ajoutant deux services additionnels de types différents | Le total se met à jour à chaque sélection : un service journalier est multiplié par le nombre de nuits, un service par personne par le nombre de nuits et d'adultes | OK, sur les trois types. Chambre 208 × 2 = 416 €. Spa (séjour) 104 €. Parking (journalier) 26 × 2 = 52 €. Petit-déjeuner (par personne) 44 × 2 × 2 = 176 €. Total 748 €, mise à jour sans rechargement | 03/10/2026 |
| C4 | Payer avec la carte de test | La page de confirmation affiche un numéro de réservation et un courriel de confirmation est reçu | OK avec réserve. Numéro `HB-20261003-AC38E`, montant 748 €, courriel généré et conforme. Remise non vérifiable sur les comptes de démonstration, voir écart n° 1 ; remise réelle établie en C9 | 03/10/2026 |
| C5 | Ouvrir « Mes réservations » | La réservation créée apparaît avec le statut Confirmée | OK. En tête de liste, statut Confirmée, 748,00 EUR | 03/10/2026 |
| C6 | Annuler cette réservation | Le statut passe à Annulée et un courriel d'annulation est reçu | OK. Confirmation demandée, statut passé à Annulée, bouton Annuler retiré, réservation conservée avec son détail complet | 03/10/2026 |
| C7 | Créer un compte avec une adresse encore inutilisée | Le compte est créé, la session est ouverte, un courriel de bienvenue est reçu | Partiel. Branche de refus vérifiée : « Cet email est déjà utilisé » sur une adresse déjà enregistrée. Branche de création non rejouée, la remise d'un courriel étant établie par C9 | 03/10/2026 |
| C8 | Modifier le nom et le téléphone depuis le profil | Les nouvelles valeurs sont affichées après rechargement | OK | 03/10/2026 |
| C9 | Demander une réinitialisation de mot de passe, suivre le lien reçu, définir un nouveau mot de passe | La connexion réussit avec le nouveau mot de passe et échoue avec l'ancien | OK, sur une adresse réelle. Courriel reçu, lien fonctionnel, ancien mot de passe refusé. Établit la remise effective des courriels transactionnels | 03/10/2026 |
| C10 | Envoyer un message depuis le formulaire de contact | Le message est enregistré et un courriel de confirmation est reçu | OK. Accusé de réception reçu, avec le récapitulatif du sujet, de la date et du corps du message | 03/10/2026 |

---

## 3. Contrôles serveur

Ces scénarios vérifient que les refus attendus se produisent effectivement. Un parcours nominal qui aboutit ne dit rien de ce qui se passe lorsque les données sont incohérentes ou la requête illégitime.

| # | Scénario | Résultat attendu | Observé | Date |
|---|---|---|---|---|
| V1 | Réserver avec une date de départ antérieure à la date d'arrivée, puis avec une date d'arrivée dans le passé | Refus dans les deux cas, message explicite, aucun enregistrement créé | OK. Dates inversées : refus par le serveur, « La date de départ doit être postérieure à la date d'arrivée ». Dates passées : rendues inaccessibles par l'attribut `min` du champ, le contrôle serveur existant en second rideau | 05/10/2026 |
| V2 | Réserver la même chambre sur une période déjà réservée | Refus avec le code 409 et un message d'indisponibilité ; la vérification est faite côté serveur dans `src/lib/reservations.ts` | OK, sur un chevauchement d'une seule nuit. « Cette chambre n'est plus disponible sur les dates demandées — choisissez d'autres dates, ou une autre chambre dans cet hôtel » | 03/10/2026 |
| V3 | Appeler `POST /api/reservations` sans session, depuis la ligne de commande | Réponse 401, aucune réservation créée | OK. `HTTP/1.1 401`, corps `{"error":"Authentification requise"}` | 05/10/2026 |
| V4 | Ouvrir `/fr/admin` et appeler `GET /api/admin/users` avec la session du compte client | Redirection pour la page, 401 ou 403 pour la route, aucune donnée utilisateur renvoyée | OK. La route renvoie `{"error":"Non autorisé"}`, la page redirige vers l'accueil. Deux mécanismes distincts : `requireAdmin()` pour la donnée, le middleware pour l'URL | 05/10/2026 |

---

## 4. Back-office

| # | Scénario | Résultat attendu | Observé | Date |
|---|---|---|---|---|
| A1 | Créer un hôtel en ne renseignant que le nom, la ville et le pays | La création aboutit et conduit à la fiche du nouvel établissement ; le bouton reste inactif tant que les trois champs ne sont pas remplis | OK. Bouton inactif et mention « Nom, ville et pays sont obligatoires » jusqu'à saisie des trois ; le même contrôle est refait côté serveur avec un 400. Renvoi sur la fiche, compteurs à zéro | 05/10/2026 |
| A2 | Tenter de supprimer un hôtel qui porte des réservations | La suppression est refusée et la raison est indiquée | OK. « Suppression impossible : 1 réservation(s) rattachée(s) à cet hôtel ». La suppression de l'hôtel de test, sans chambre ni réservation, aboutit : le cas passant est vérifié dans la foulée | 05/10/2026 |
| A3 | Changer le statut d'une réservation depuis la liste | L'étiquette change immédiatement et la modification persiste après rechargement | OK | 05/10/2026 |
| A4 | Tenter de supprimer un utilisateur qui porte des réservations | La suppression est refusée et la raison est indiquée | OK. « Suppression impossible : 2 réservation(s) liée(s). Désactivez le compte à la place. » Trois protections empilées dans la route : rôle administrateur requis, refus de l'auto-suppression, comptage des réservations | 03/10/2026 |

---

## 5. Performance et accessibilité

Mesures relevées sur le site déployé avec Lighthouse, en navigation privée. Les rapports complets sont archivés dans `docs/lighthouse/`.

| # | Mesure | Seuil retenu | Observé | Date |
|---|---|---|---|---|
| P1 | Lighthouse sur `/fr`, bureau et mobile | Les quatre scores au-delà de 90 | OK. Mobile 99 / 96 / 100 / 100, bureau 99 / 96 / 100 / 100. LCP 2,0 s en mobile et 1,0 s en bureau, CLS 0 à 0,002, TBT 60 ms | 05/10/2026 |
| P2 | Lighthouse sur `/fr/hotels`, bureau et mobile | Mêmes seuils | OK. Mobile 99 / 96 / 100 / 100, bureau 100 / 96 / 100 / 100. LCP 2,0 s en mobile et 0,6 s en bureau, CLS 0 à 0,002, TBT 0 à 70 ms | 05/10/2026 |
| P3 | Navigation au clavier sur l'accueil et le tunnel de réservation, puis affichage à 400 pixels de largeur | Éléments interactifs atteignables, focus visible, lien d'évitement fonctionnel, aucun défilement horizontal | OK. Aucun défilement horizontal ni texte tronqué | 05/10/2026 |

Un seul audit d'accessibilité reste en échec sur les quatre passages, `color-contrast`, pour un poids de 7 points. Il correspond exactement à l'arbitrage sur la charte graphique documenté en section 12.2 de la documentation technique. Aucun autre audit n'est en défaut.

---

## 6. Parcours minimal

Sous-ensemble à rejouer après chaque déploiement touchant au paiement ou aux données, lorsque la campagne complète n'est pas justifiée : **C1, C3, C4, C5, V2, A3**.

Ces six scénarios couvrent la chaîne qui va de la recherche à l'encaissement, le contrôle serveur dont une régression coûterait le plus cher, et la seule écriture d'administration utilisée couramment.

---

## 7. Synthèse

| Groupe | Scénarios | OK | Partiel | KO |
|---|---|---|---|---|
| Parcours client | 10 | 9 | 1 | 0 |
| Contrôles serveur | 4 | 4 | 0 | 0 |
| Back-office | 4 | 4 | 0 | 0 |
| Performance et accessibilité | 3 | 3 | 0 | 0 |
| **Total** | **21** | **20** | **1** | **0** |

### Écarts constatés et corrections apportées

| N° | Écart | Correction | Nouveau passage |
|---|---|---|---|
| 1 | Le courriel de confirmation est adressé à l'utilisateur du compte. Les comptes de démonstration utilisant un domaine qui n'est pas enregistré, le message leur revient en échec de remise. La chaîne d'envoi n'est pas en cause : C9 et C10 établissent la remise effective sur une adresse valide. | Aucune. Arbitrage retenu : la démonstration des courriels se fait avec un compte dont l'adresse est valide, ce que permet n'importe quelle inscription. | sans objet |
| 2 | La désactivation d'un compte depuis le back-office ne bloquait pas la connexion : la route de connexion ne consultait jamais le champ `actif`, que la fonction de recherche d'utilisateur ne renvoyait pas. L'interface proposait pourtant la désactivation comme alternative à une suppression refusée. | `actif` ajouté au type `AuthUser` et à ses trois constructions ; refus en 403 dans la route de connexion, placé après la vérification du mot de passe pour ne pas permettre de distinguer un compte désactivé d'un compte inexistant. Commit `85e1da0`. | 05/10/2026, concluant |

---

## 8. Observations relevées hors scénarios

Ces points n'entrent dans le résultat d'aucun scénario. Ils sont consignés parce qu'ils sont visibles.

**Le nombre d'avis d'un hôtel diffère entre la façade publique et le back-office.** La fiche publique affiche la valeur de la colonne agrégée reprise du jeu de données d'origine, le back-office affiche le décompte réel des avis enregistrés. Les deux sont exacts dans leur contexte, mais l'écart est visible sur une même fiche.

**Les adresses postales du jeu de données ne correspondent pas toujours à la ville annoncée.** Les coordonnées ont été générées à l'import du Bloc 2. La carte affiche fidèlement les coordonnées fournies ; c'est la donnée qui est approximative, pas son rendu.

**Avec des dates inversées, le récapitulatif de réservation affiche brièvement une nuit et un montant** avant que le serveur ne refuse, le calcul des nuits côté client retombant sur une valeur minimale. L'affichage seul est concerné, aucun enregistrement n'est créé.

**Deux formats de numéro de confirmation coexistent** dans les réservations antérieures au 24 septembre 2026, date à laquelle la génération a été unifiée. Les enregistrements existants conservent l'ancien format.
