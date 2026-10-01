# Guide utilisateur

**Book Your Travel** — application de réservation hôtelière
Version 1.0 — septembre 2026

Adresse du site : https://hotel-booking-bloc3.vercel.app

---

## Sommaire

**Première partie — Le site public**

1. Découvrir le site
2. Rechercher un hôtel
3. Consulter la fiche d'un établissement
4. Réserver une chambre
5. Payer
6. Son compte
7. Suivre et annuler ses réservations
8. Contacter l'équipe

**Seconde partie — L'administration**

9. Accéder au back-office
10. Le tableau de bord
11. Gérer les hôtels
12. Suivre les réservations
13. Gérer les comptes utilisateurs

**Annexes**

- Comptes de démonstration et carte de test
- Questions fréquentes
- Messages d'erreur et que faire

---

# Première partie — Le site public

## 1. Découvrir le site

### 1.1 La page d'accueil

Le site s'ouvre sur un carrousel d'images de destinations, par-dessus lequel se trouve le formulaire de recherche. En descendant, trois sections se succèdent : les meilleures destinations avec le nombre d'hôtels disponibles dans chacune, les offres du moment triées par prix, et les raisons de réserver.

### 1.2 La barre de navigation

Elle reste visible en haut de toutes les pages et donne accès à l'accueil, à la liste des hôtels et à la page de contact.

À droite se trouvent le bouton de connexion, ou, une fois identifié, l'accès au profil et aux réservations. Un compte administrateur voit en plus un lien vers le back-office.

Deux éléments méritent un mot. Le sélecteur de langue et celui de devise sont présents mais inactifs : le site fonctionne en français et en euros. Le bouton marqué d'un pictogramme d'accessibilité bascule l'ensemble du site vers une police conçue pour les lecteurs dyslexiques ; un second clic revient à la police d'origine.

Sur mobile, la navigation se replie derrière le bouton à trois barres.

### 1.3 Le pied de page

Il regroupe les liens vers les pages d'information : à propos, contact, hôtels, questions fréquentes, mentions légales et confidentialité.

---

## 2. Rechercher un hôtel

### 2.1 Depuis la page d'accueil

Le formulaire du carrousel comporte quatre blocs.

**Le type de séjour.** Six onglets sont affichés — Hôtel, Vol, Vol+Hôtel, Studio, Croisière, Voiture — mais seul le premier est actif. Les cinq autres sont grisés : ils montrent ce que deviendrait la plateforme si elle était étendue, sans prétendre le faire aujourd'hui.

**La destination.** Une liste déroulante des douze villes couvertes. Elle n'est pas libre : ce sont les destinations réellement présentes en base.

**Les dates.** Arrivée et départ, avec le calendrier du navigateur. La date de départ doit être postérieure à la date d'arrivée, et la date d'arrivée ne peut pas être dans le passé.

**Les voyageurs.** Nombre de chambres, d'adultes et d'enfants.

Le bouton de recherche conduit à la liste des hôtels de la ville choisie.

### 2.2 Depuis la liste des hôtels

L'entrée « Hôtels » de la barre de navigation affiche les 102 établissements, douze par page.

Chaque carte présente la photographie, le nom, le classement en étoiles, une description courte, la ville et le pays, la note moyenne sur dix avec son appréciation — de « Correct » à « Exceptionnel » — et le nombre d'avis.

Le titre de la page rappelle le filtre en cours et le nombre d'établissements trouvés. Quand un filtre est actif, une étiquette l'affiche avec une croix pour le retirer.

La pagination en bas propose les cinq numéros de page les plus proches de la page courante, encadrés par les boutons Précédent et Suivant.

### 2.3 Ce qui n'existe pas

Il n'y a ni curseur de prix, ni filtre par équipement, ni tri. La liste se restreint par ville ou par recherche textuelle, et c'est tout. Ce choix est documenté comme une limite assumée dans la documentation technique.

---

## 3. Consulter la fiche d'un établissement

Un clic sur « Voir les chambres » ouvre la fiche de l'hôtel.

### 3.1 Organisation de la page

L'en-tête donne le nom, le classement, l'adresse et la note. En dessous, la page se divise en trois colonnes sur grand écran : la navigation par onglets à gauche, le contenu au centre, et à droite un encadré récapitulatif accompagné des arguments de réservation.

Sur mobile, les trois colonnes s'empilent.

### 3.2 Les cinq onglets

**Description** présente l'établissement, son cadre et ses prestations.

**Chambres & Offres** est l'onglet central. Chaque chambre y est décrite — type, literie, capacité maximale en adultes et en enfants, surface, vue — puis suivie des offres qui la tarifent. Une même chambre porte souvent plusieurs offres : une formule souple, annulable, plus chère, et une formule non remboursable moins chère. Chaque offre affiche son prix par nuit, sa politique d'annulation et sa formule de pension.

C'est le bouton de réservation d'une offre, et non d'une chambre, qui lance le parcours.

**Équipements** liste les prestations de l'établissement : connexion sans fil, stationnement, piscine, et le reste.

**Avis clients** affiche les commentaires avec leur note, le pays d'origine et le type de voyageur.

**Localisation** situe l'hôtel et rappelle son adresse complète.

---

## 4. Réserver une chambre

### 4.1 Il faut un compte

La réservation exige d'être identifié. Un visiteur non connecté qui lance une réservation est envoyé vers la page de connexion, et revient automatiquement là où il en était une fois identifié.

Ce n'est pas une contrainte d'interface mais une règle appliquée côté serveur : une réservation est toujours rattachée au compte qui l'a créée, jamais à une identité fournie par le navigateur.

### 4.2 Le formulaire

La page de réservation se divise en deux : le formulaire à gauche, le récapitulatif à droite.

**Vos dates et voyageurs.** Arrivée, départ, nombre d'adultes et d'enfants. Le nombre de nuits se déduit des dates. Les capacités maximales de la chambre sont respectées : au-delà, la réservation est refusée avec un message qui indique la limite.

**Les services additionnels.** Les prestations proposées par l'établissement, avec leur prix et leur mode de calcul. Un service journalier est multiplié par le nombre de nuits, un service par personne par le nombre de nuits et d'adultes, un service au séjour ou à l'unité reste au prix fixe.

**Les demandes particulières.** Un champ libre pour un étage, une heure d'arrivée tardive ou tout autre souhait.

### 4.3 Le récapitulatif

La colonne de droite affiche l'hôtel, la chambre, l'offre, les dates, le nombre de voyageurs, le détail ligne par ligne et le total. Elle se recalcule à chaque modification.

Ce montant est indicatif : le serveur recalcule le total à partir des prix enregistrés en base au moment de la validation. Les deux coïncident en usage normal ; en cas d'écart, c'est le calcul du serveur qui fait foi.

### 4.4 Si les dates ne sont pas disponibles

Une chambre déjà réservée sur tout ou partie de la période est refusée. Un bandeau ambre apparaît en haut du formulaire : **Dates non disponibles**.

Deux séjours se chevauchent dès que l'un commence avant que l'autre ne finisse. Une chambre libérée le matin peut donc être reprise le soir même : ce n'est pas un chevauchement.

Une réservation créée mais non payée retient la chambre pendant trente minutes, le temps du paiement. Passé ce délai, elle se libère d'elle-même. Si la chambre vous intéresse et qu'elle est affichée comme prise, il peut suffire d'attendre.

### 4.5 Validation

La validation crée la réservation au statut **En attente**, lui attribue un numéro de confirmation et conduit à la page de paiement. Rien n'est encore réservé fermement : seul le paiement confirme.

---

## 5. Payer

### 5.1 La page de paiement

Elle rappelle le récapitulatif du séjour et présente le formulaire de carte bancaire : numéro, date d'expiration, cryptogramme, nom du porteur.

Le numéro est vérifié pendant la saisie par la clé de Luhn, l'algorithme qui détecte une erreur de frappe sur un numéro de carte. Le type de carte est reconnu automatiquement. La date d'expiration doit être future, le cryptogramme comporte trois ou quatre chiffres.

### 5.2 Le mode test

Le site fonctionne avec les clés de test de Stripe : **aucun paiement réel n'est effectué et aucune carte réelle ne doit être saisie.**

La carte à utiliser est la `4242 4242 4242 4242`, avec n'importe quelle date future et n'importe quel cryptogramme. La page rappelle aussi les numéros qui simulent un échec : carte refusée, carte expirée, cryptogramme incorrect, fonds insuffisants. Ils servent à vérifier que les erreurs sont correctement présentées.

### 5.3 Après le paiement

Le paiement accepté, la réservation passe au statut **Confirmée**, reçoit son numéro de confirmation définitif et un courriel part vers l'adresse du compte.

La page de confirmation affiche le numéro, les dates, l'établissement et le montant réglé. Ce numéro se présente sous la forme `HB-20260924-K7M2P` : préfixe, date, puis cinq caractères tirés d'un alphabet qui exclut le zéro, le O, le un et le I, pour qu'il puisse être dicté au téléphone sans ambiguïté.

Si le courriel n'arrive pas, la réservation est malgré tout enregistrée : elle figure dans « Mes réservations ». L'envoi du message n'est pas bloquant, une indisponibilité du serveur de courrier ne remet pas en cause un paiement encaissé.

---

## 6. Son compte

### 6.1 Créer un compte

Le formulaire d'inscription demande le nom, le prénom, l'adresse électronique, un mot de passe et, facultativement, un téléphone. Toute inscription crée un compte client.

Le mot de passe est haché avant d'être enregistré. Il n'est jamais stocké en clair, ni affiché, ni renvoyé par le site : personne, pas même un administrateur, ne peut le lire.

Un courriel de bienvenue est envoyé après l'inscription.

### 6.2 Se connecter

Adresse électronique et mot de passe. La session dure sept jours.

La page de connexion affiche un encadré « Mode démonstration » avec deux comptes de test et un bouton qui remplit le formulaire d'un clic. Il est destiné au jury et aux visiteurs qui veulent essayer sans s'inscrire.

Après connexion, le site ramène à la page d'où venait la demande.

### 6.3 Mot de passe oublié

Le lien « Mot de passe oublié » de la page de connexion demande l'adresse électronique et envoie un message contenant un lien de réinitialisation à durée limitée. Ce lien conduit à un formulaire de nouveau mot de passe.

### 6.4 Le profil

La page « Mon profil » permet de consulter et modifier le nom, le prénom, l'adresse électronique et le téléphone, ainsi que de changer le mot de passe. Elle rappelle la date d'inscription et celle de la dernière connexion.

Elle propose enfin la suppression du compte. Un avertissement précise ce qui disparaît — informations personnelles, historique de connexion, favoris — et rappelle que l'opération est irréversible. Les réservations passées, elles, sont conservées : ce sont des pièces commerciales.

---

## 7. Suivre et annuler ses réservations

### 7.1 La liste

« Mes réservations » présente toutes les réservations du compte, de la plus récente à la plus ancienne. Chaque ligne donne l'établissement, la ville, le type de chambre, les dates, le prix total et le statut, affiché sous forme d'étiquette colorée.

Six statuts existent :

| Statut | Signification |
|---|---|
| En attente | créée, paiement non effectué |
| Confirmée | payée, chambre bloquée |
| Annulée | annulée par vous |
| Refusée | refusée par l'établissement |
| Terminée | séjour achevé |
| En cours | séjour en cours, vous êtes sur place |

### 7.2 Le détail

Le détail d'une réservation reprend le numéro de confirmation, la date à laquelle elle a été passée, l'établissement, la chambre, l'offre retenue, les dates d'arrivée et de départ, la durée, le nombre de voyageurs, les services additionnels choisis, le prix par nuit et le total.

### 7.3 Annuler

Une réservation peut être annulée depuis son détail. Elle passe au statut **Annulée** et la chambre redevient disponible. Un courriel d'annulation est envoyé.

Deux points à connaître. Les conditions d'annulation dépendent de l'offre retenue : une offre non remboursable reste due. Et la modification des dates d'une réservation n'est pas possible depuis l'espace client ; il faut annuler et réserver à nouveau, ou passer par un administrateur.

---

## 8. Contacter l'équipe

La page Contact propose un formulaire : nom, adresse électronique, téléphone facultatif, sujet et message. Aucun compte n'est nécessaire.

Le message est enregistré et parvient à l'administration, qui le voit marqué comme non lu. Un accusé de réception est envoyé à l'adresse indiquée.

La page **À propos** répond par ailleurs aux questions courantes sur le projet, propose un parcours de test conseillé, et regroupe les mentions légales.

---

# Seconde partie — L'administration

## 9. Accéder au back-office

L'administration est à l'adresse `/fr/admin`. Elle est réservée aux comptes portant le rôle administrateur.

Un compte administrateur connecté voit apparaître le lien dans la barre de navigation. Un compte client qui tenterait l'adresse directement est renvoyé vers l'accueil ; un visiteur non connecté est envoyé vers la page de connexion.

Cette vérification est faite à deux endroits : à l'ouverture de la page, et à chaque requête de données. Contourner l'interface ne donne accès à rien.

Pour donner le rôle administrateur à un compte, deux voies : depuis l'administration elle-même, dans la fiche de l'utilisateur, ou directement en base :

```sql
UPDATE utilisateur SET id_role = 1 WHERE email_user = 'adresse@exemple.fr';
```

### 9.1 L'interface

Une barre latérale donne accès aux quatre sections : Tableau de bord, Hôtels, Réservations, Utilisateurs. La section courante est mise en évidence. Le logo ramène au site public.

---

## 10. Le tableau de bord

La page d'accueil de l'administration affiche les compteurs de l'application — nombre d'hôtels, de chambres, de réservations, d'utilisateurs — puis les cinq dernières réservations enregistrées, avec leur client, leur établissement et leur statut.

C'est une vue de contrôle : elle répond à la question « que s'est-il passé depuis ma dernière visite ».

---

## 11. Gérer les hôtels

### 11.1 La liste

Les établissements sont affichés quinze par page. Un champ de recherche filtre sur le nom ou la ville ; la recherche se déclenche seule après une courte pause de frappe, sans bouton à presser.

### 11.2 Créer un hôtel

Le bouton « Nouvel hôtel » ouvre un formulaire en trois blocs : identité, adresse, contact.

Trois champs sont obligatoires : le nom, la ville et le pays. Tant qu'ils ne sont pas renseignés, le bouton de création reste inactif et un rappel s'affiche. Les autres champs — étoiles, description, rue, code postal, courriel, téléphone, site web, image principale — sont facultatifs et peuvent être complétés plus tard.

La création conduit directement à la fiche du nouvel établissement, où s'ajoutent ensuite les chambres, les offres et les équipements.

### 11.3 La fiche d'un hôtel

La fiche présente toutes les informations en édition directe : on modifie un champ et on enregistre, sans changer de page. Elle donne aussi accès aux chambres, aux offres et aux avis rattachés.

### 11.4 Supprimer

La suppression est protégée. Un hôtel qui porte des réservations ne peut pas être supprimé, et le site explique pourquoi plutôt que d'échouer silencieusement.

Ce n'est pas une précaution d'interface mais une contrainte de la base de données : une réservation est une pièce commerciale, elle ne peut pas perdre l'établissement auquel elle se rapporte. Les chambres, les offres et les images, elles, sont supprimées avec leur hôtel — elles n'existent pas sans lui.

---

## 12. Suivre les réservations

### 12.1 La liste

Toutes les réservations, de la plus récente à la plus ancienne. Chaque ligne donne le numéro de confirmation, le client, l'hôtel, la chambre, les dates du séjour, le total et le statut.

Un champ de recherche filtre sur le client ou le numéro de confirmation. Une liste déroulante filtre par statut.

### 12.2 Changer un statut

Le statut se modifie directement depuis la liste, sans ouvrir la fiche. Le changement est immédiat et la couleur de l'étiquette suit.

C'est ici qu'on marque une réservation comme **En cours** à l'arrivée du client, **Terminée** à son départ, ou **Refusée** si l'établissement ne peut pas honorer le séjour.

Attention : les statuts Confirmée et En cours bloquent la chambre sur la période. Passer une réservation à Annulée ou Refusée libère immédiatement les dates pour un autre client.

### 12.3 La fiche détaillée

Elle rassemble le séjour, les montants, les coordonnées du client et le paiement associé — montant, méthode, statut et référence Stripe.

Cette référence est utile en cas de litige : elle permet de retrouver la transaction dans le tableau de bord Stripe.

---

## 13. Gérer les comptes utilisateurs

### 13.1 La liste

Tous les comptes, avec un champ de recherche et un filtre par rôle. Chaque ligne donne le nom, l'adresse électronique, le rôle, la date d'inscription et le nombre de réservations.

### 13.2 Changer un rôle

Le rôle se modifie depuis la liste. Trois valeurs : administrateur, prestataire, client.

Le rôle prestataire existe en base mais ne donne accès à aucune interface dédiée : il est prévu pour une évolution où un hôtelier gérerait son propre établissement. L'attribuer aujourd'hui revient à donner les droits d'un client.

Un changement de rôle prend effet à la connexion suivante de la personne concernée, car son jeton de session porte encore l'ancien rôle. Pour une prise d'effet immédiate, il faut lui demander de se déconnecter et se reconnecter.

### 13.3 Activer ou désactiver un compte

Un compte désactivé ne peut plus se connecter, mais ses données et ses réservations sont conservées. C'est la mesure à privilégier sur une suppression : réversible, et sans perte d'historique.

### 13.4 La fiche d'un utilisateur

Elle donne les coordonnées, le rôle, les dates d'inscription et de dernière connexion, la liste des réservations et celle des avis rédigés.

### 13.5 Supprimer

Comme pour les hôtels, la suppression est refusée si le compte porte des réservations. Là encore, une réservation ne peut pas perdre son client.

---

# Annexes

## A. Comptes de démonstration et carte de test

Sur le site en ligne, mot de passe commun `Demo2026!` :

| Adresse | Rôle | Ce qu'elle permet de voir |
|---|---|---|
| `demo.client@bookyourtravel.fr` | client | recherche, réservation, paiement, profil, mes réservations |
| `demo.admin@bookyourtravel.fr` | administrateur | tout ce qui précède, plus le back-office |

Carte de paiement : `4242 4242 4242 4242`, date future, cryptogramme au choix.

**Parcours conseillé pour découvrir l'application en dix minutes**

1. Depuis l'accueil, choisir une destination et lancer la recherche
2. Ouvrir un hôtel, aller sur l'onglet Chambres & Offres, comparer deux offres d'une même chambre
3. Réserver, se connecter avec le compte client, ajouter un service additionnel
4. Payer avec la carte de test, lire la page de confirmation
5. Ouvrir « Mes réservations » et vérifier le statut Confirmée
6. Se déconnecter, se reconnecter avec le compte administrateur
7. Ouvrir Réservations dans le back-office et retrouver la réservation qui vient d'être créée
8. Changer son statut et vérifier que l'étiquette suit

---

## B. Questions fréquentes

**Faut-il un compte pour chercher un hôtel ?**
Non. La recherche, la liste et les fiches sont accessibles à tous. Seule la réservation demande une identification.

**Le paiement est-il réel ?**
Non. Le site fonctionne avec les clés de test de Stripe. Aucune somme n'est débitée et aucune carte réelle ne doit être saisie.

**Je n'ai pas reçu mon courriel de confirmation.**
Vérifiez les indésirables. La réservation est enregistrée dans tous les cas : elle figure dans « Mes réservations » avec son numéro de confirmation.

**Puis-je modifier les dates d'une réservation ?**
Pas depuis l'espace client. Il faut annuler et réserver à nouveau, ou demander à un administrateur.

**Pourquoi ne puis-je pas sélectionner une ville qui n'est pas dans la liste ?**
La liste reprend les destinations réellement présentes en base. Une ville absente ne comporte aucun établissement.

**Les sélecteurs de langue et de devise ne fonctionnent pas.**
C'est volontaire. Le site fonctionne en français et en euros. Les sélecteurs sont en place pour une extension ultérieure.

**Pourquoi la chambre que je veux est-elle indisponible alors que personne ne l'a réservée ?**
Une réservation créée et non payée retient la chambre trente minutes. Si quelqu'un a abandonné son parcours, les dates se libèrent d'elles-mêmes passé ce délai.

**J'ai reçu le rôle administrateur mais je ne vois pas le back-office.**
Déconnectez-vous et reconnectez-vous. Votre session porte encore l'ancien rôle.

---

## C. Messages d'erreur et que faire

| Message | Cause | Solution |
|---|---|---|
| Authentification requise | session expirée ou absente | se reconnecter |
| Cette chambre n'est plus disponible sur les dates demandées | chevauchement avec une réservation existante | changer de dates, ou patienter si la réservation concurrente est en attente de paiement |
| La date de départ doit être postérieure à la date d'arrivée | dates inversées | corriger les dates |
| La date d'arrivée ne peut pas être dans le passé | date passée | corriger la date |
| Cette chambre accueille au maximum N adulte(s) | capacité dépassée | réduire le nombre de voyageurs ou choisir une autre chambre |
| Le paiement n'a pas été confirmé par Stripe | carte refusée ou saisie interrompue | reprendre le paiement depuis « Mes réservations » |
| Ce paiement a déjà été utilisé | double envoi de la confirmation | vérifier le statut de la réservation, elle est probablement déjà confirmée |
| Accès refusé à cette réservation | la réservation appartient à un autre compte | vérifier le compte connecté |
| Non autorisé | page ou donnée réservée aux administrateurs | se connecter avec un compte administrateur |

En cas de difficulté persistante, le formulaire de la page Contact permet de joindre l'équipe.
