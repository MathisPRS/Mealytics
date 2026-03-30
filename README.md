# Mealytics

Application web mobile-first de suivi nutritionnel, auto-hébergeable via Docker. Permet de journaliser ses repas, suivre son poids, gérer ses recettes personnelles et calculer ses besoins caloriques selon son profil.

---

## Sommaire

- [Fonctionnalités](#fonctionnalités)
- [Stack technique](#stack-technique)
- [Lancement rapide (Docker)](#lancement-rapide-docker)
- [Développement local](#développement-local)
- [Variables d'environnement](#variables-denvironnement)
- [Architecture du projet](#architecture-du-projet)
- [API Backend](#api-backend)
- [Base de données](#base-de-données)
- [Calcul nutritionnel](#calcul-nutritionnel)

---

## Fonctionnalités

### Journal alimentaire
- Suivi quotidien par repas (Petit-déjeuner, Déjeuner, Dîner, Collation)
- Bague SVG de calories et barres de progression des macros (protéines, glucides, lipides)
- Recherche dans une base de ~299 aliments (Ciqual ANSES 2020 + USDA FoodData Central 2024)
- Onglets Récents, Favoris, et Mes recettes dans la modale d'ajout
- Suivi de l'hydratation (verres de 250 ml) intégré au journal
- Historique calendaire avec codes couleur selon le ratio calorique du jour

### Suivi du poids
- Ajout, modification et suppression d'entrées
- Graphique en aire (Recharts) avec sélecteur 30 / 90 jours
- Indicateurs de delta entre chaque entrée

### Recettes personnelles
- Création et édition de recettes à partir de la base d'aliments
- Calcul automatique des totaux nutritionnels
- Ajout direct d'une recette dans un repas du journal
- Marquage en favoris

### Profil & Onboarding
- Wizard 9 étapes : genre, poids, taille, âge, activité professionnelle, sport, métabolisme, objectif
- Calcul du BMR (Mifflin-St Jeor) et des besoins caloriques (modèle PAL FAO/WHO/UNU 2001 à 3 facteurs)
- Macros personnalisées selon l'objectif (perte, maintien, prise de masse) et le genre
- Édition ultérieure de l'objectif et des niveaux d'activité depuis le profil

### PWA
- Installable sur mobile (iOS & Android) en mode standalone
- Pre-cache des assets avec Workbox
- Stratégie NetworkFirst pour les appels API

---

## Stack technique

| Couche | Technologie |
|---|---|
| Frontend | React 19, React Router v7, Tailwind CSS v3, Recharts, Vite 8 |
| PWA | `vite-plugin-pwa` (Workbox) |
| Backend | Node.js, Express 5 |
| Base de données | PostgreSQL 16 |
| Auth | JWT HS256 (jsonwebtoken), bcryptjs |
| Sécurité | Helmet, CORS, express-rate-limit |
| Déploiement | Docker (multi-stage build), docker-compose |

---

## Lancement rapide (Docker)

### Prérequis
- Docker ≥ 24
- Docker Compose ≥ 2

### 1. Cloner le dépôt
```bash
git clone <url-du-repo>
cd Mealytics
```

### 2. Configurer l'environnement
```bash
cp .env.example .env
```

Éditez `.env` et renseignez **au minimum** :
```env
DB_PASSWORD=un_mot_de_passe_fort
JWT_SECRET=une_chaine_aleatoire_longue
```

### 3. Démarrer
```bash
docker compose up -d
```

L'application est disponible sur **http://localhost:8043** (ou le port défini par `APP_PORT`).

### Arrêter
```bash
docker compose down
```

Les données PostgreSQL sont persistées dans le volume Docker `postgres_data`. Pour tout supprimer :
```bash
docker compose down -v
```

---

## Développement local

### Prérequis
- Node.js ≥ 20
- PostgreSQL 16 en cours d'exécution en local

### Backend
```bash
cd backend
cp .env.example .env   # ou créer un fichier .env
npm install
npm run dev            # démarre avec nodemon sur le port 4000
```

Variables nécessaires dans `backend/.env` :
```env
DATABASE_URL=postgresql://postgres:<password>@localhost:5432/mealytics
JWT_SECRET=dev_secret
JWT_EXPIRES=1d
FRONTEND_URL=http://localhost:5173
```

### Frontend
```bash
cd frontend
npm install
npm run dev            # démarre Vite sur le port 5173
```

Le proxy Vite redirige automatiquement `/api/*` et `/auth/*` vers `http://localhost:4000` — aucune configuration CORS manuelle n'est nécessaire en développement.

---

## Variables d'environnement

| Variable | Requis | Défaut | Description |
|---|---|---|---|
| `DB_PASSWORD` | ✅ | — | Mot de passe PostgreSQL (l'app refuse de démarrer si absent) |
| `JWT_SECRET` | ✅ | — | Clé secrète JWT (l'app refuse de démarrer si absente) |
| `JWT_EXPIRES` | — | `1d` | Durée de validité des tokens JWT |
| `FRONTEND_URL` | — | `http://localhost:8043` | Origine autorisée pour CORS |
| `APP_PORT` | — | `8043` | Port exposé par docker-compose |

---

## Architecture du projet

```
Mealytics/
├── Dockerfile                  # Build multi-stage (frontend Vite → backend Node)
├── docker-compose.yml          # Services : app + postgres
├── .env.example
│
├── backend/
│   ├── package.json
│   └── src/
│       ├── index.js            # Point d'entrée Express, sert aussi le frontend compilé
│       ├── db/
│       │   ├── pool.js         # Pool de connexions PostgreSQL
│       │   └── migrate.js      # Migrations automatiques au démarrage
│       ├── middleware/
│       │   └── auth.js         # Vérification JWT
│       └── routes/
│           ├── auth.js         # /auth/register, /auth/login, /auth/me
│           ├── journal.js      # /api/journal
│           ├── weight.js       # /api/weight
│           ├── recipes.js      # /api/recipes
│           └── user.js         # /api/profile, /api/favorites, /api/recents, /api/water
│
└── frontend/
    ├── package.json
    ├── vite.config.js
    ├── tailwind.config.js
    └── src/
        ├── App.jsx             # Router et routes protégées
        ├── contexts/
        │   └── AppContext.jsx  # État global (journal, poids, recettes, eau…)
        ├── components/
        │   ├── AddFoodModal.jsx
        │   └── BottomNav.jsx
        ├── pages/
        │   ├── Login.jsx
        │   ├── Onboarding.jsx
        │   ├── Journal.jsx
        │   ├── JournalHistorique.jsx
        │   ├── Recettes.jsx
        │   ├── CreateRecette.jsx
        │   ├── Poids.jsx
        │   ├── Profil.jsx
        │   ├── MesReglages.jsx
        │   ├── MonObjectif.jsx
        │   └── MesActivites.jsx
        ├── data/
        │   └── foods.js        # ~299 aliments (Ciqual 2020 + USDA 2024)
        └── utils/
            ├── api.js          # Fonctions fetch vers l'API
            └── nutrition.js    # Calculs BMR, TDEE, macros
```

### Flux de déploiement Docker

Le `Dockerfile` utilise un **build multi-stage** :
1. **Stage 1 (`builder`)** — image `node:20-alpine` : installe les dépendances frontend et compile le bundle Vite dans `dist/`.
2. **Stage 2 (production)** — image `node:20-alpine` : installe uniquement les dépendances backend de production, copie `backend/src/` et le `dist/` du stage 1 dans `./public/`. L'application tourne sous l'utilisateur non-root `mealytics`, expose le port `4000`.

Express sert les fichiers statiques de `./public/` et renvoie `index.html` pour toutes les routes inconnues (SPA fallback).

---

## API Backend

Toutes les routes protégées nécessitent l'en-tête :
```
Authorization: Bearer <token>
```

### Authentification — `/auth/*`
> Rate-limit : 20 requêtes / 15 min

| Méthode | Route | Description |
|---|---|---|
| `POST` | `/auth/register` | Créer un compte (email, password, name) |
| `POST` | `/auth/login` | Connexion, retourne un JWT + profil utilisateur |
| `GET` | `/auth/me` | 🔒 Vérifier / rafraîchir le profil courant |

### Journal — `/api/journal/*` 🔒

| Méthode | Route | Description |
|---|---|---|
| `GET` | `/api/journal?date=YYYY-MM-DD` | Entrées du jour, groupées par repas |
| `POST` | `/api/journal` | Ajouter un aliment (met aussi à jour les Récents) |
| `DELETE` | `/api/journal/:id` | Supprimer une entrée |
| `GET` | `/api/journal/summary?year=YYYY&month=MM` | Résumé mensuel (calories + macros par jour) |

### Poids — `/api/weight/*` 🔒

| Méthode | Route | Description |
|---|---|---|
| `GET` | `/api/weight` | Toutes les entrées de poids |
| `POST` | `/api/weight` | Ajouter / mettre à jour (upsert par date) |
| `DELETE` | `/api/weight/:id` | Supprimer une entrée |

### Recettes — `/api/recipes/*` 🔒

| Méthode | Route | Description |
|---|---|---|
| `GET` | `/api/recipes` | Toutes les recettes de l'utilisateur |
| `POST` | `/api/recipes` | Créer une recette (name + ingredients JSON) |
| `PUT` | `/api/recipes/:id` | Modifier (name, ingredients, liked) |
| `DELETE` | `/api/recipes/:id` | Supprimer |

### Profil & divers — `/api/*` 🔒

| Méthode | Route | Description |
|---|---|---|
| `PUT` | `/api/profile` | Mettre à jour les infos du profil |
| `GET` | `/api/favorites` | Liste des aliments favoris |
| `POST` | `/api/favorites/toggle` | Ajouter / retirer un favori |
| `GET` | `/api/recents` | 20 derniers aliments utilisés |
| `GET` | `/api/water?date=YYYY-MM-DD` | Hydratation du jour (en ml) |
| `POST` | `/api/water` | Incrémenter / décrémenter l'hydratation (delta en ml) |

### Health check

| Méthode | Route | Description |
|---|---|---|
| `GET` | `/health` | Retourne `{ status: "ok" }` |

---

## Base de données

Les migrations s'exécutent **automatiquement au démarrage** du backend (`migrate.js`). Toutes les tables sont créées si elles n'existent pas (`CREATE TABLE IF NOT EXISTS`).

| Table | Description |
|---|---|
| `users` | Comptes, profil physique, préférences, objectifs |
| `journal_entries` | Entrées alimentaires quotidiennes par repas |
| `weight_log` | Historique de poids (1 entrée par jour et par utilisateur) |
| `recipes` | Recettes personnelles avec ingrédients en JSONB |
| `favorites` | Aliments favoris par utilisateur |
| `recents` | Derniers aliments utilisés (max 20 par utilisateur) |
| `water_log` | Hydratation quotidienne (1 entrée par jour et par utilisateur) |

---

## Calcul nutritionnel

### BMR (Métabolisme de base)
Formule de **Mifflin-St Jeor** :
- Homme : `(10 × poids) + (6.25 × taille) − (5 × âge) + 5`
- Femme : `(10 × poids) + (6.25 × taille) − (5 × âge) − 161`

### TDEE (Dépense énergétique totale)
Modèle **FAO/WHO/UNU 2001** à 3 facteurs :
- **PAL professionnel** : sédentaire (1.20) → travail physique intense (1.725)
- **Incrément sportif** : aucun sport (0.00) → tous les jours intensif (+0.35)
- **Multiplicateur métabolique** : lent (×0.95), normal (×1.00), rapide (×1.05)

PAL final plafonné à 1.90 (maximum physiologique validé FAO/WHO/UNU).

`TDEE = BMR × (PAL_job + incrément_sport) × multiplicateur_métabolisme`

### Macros cibles
Calculées selon les références ISSN / ANSES / Morton 2018, différenciées par genre et adaptées à l'objectif (perte de poids, maintien, prise de masse).

---

## Sécurité

- JWT signé en HS256 avec algorithme verrouillé (prévention de l'attaque `alg:none`), claim `iss: mealytics-api`
- `DB_PASSWORD` et `JWT_SECRET` déclenchent un arrêt immédiat (`process.exit(1)`) si absents
- Rate limiting sur `/auth/*` : 20 requêtes / 15 min
- En-têtes sécurisés via Helmet (CSP autorisant Google Fonts)
- Limite de payload JSON : 50 ko
- Rejet des requêtes non-JSON sur les routes mutantes
- Hachage des mots de passe : bcrypt, coût 12, longueur 8–128 caractères


## Reste à faire :

Feature a rajouter : 
- Liste des aliments les plus nuttritifs par catégorie: lipidue, glucide, proteine : a mettre dans un nouvelle onglet dnas Profil : s'Informer
- Résumé Hebdommadaire : La semaine en un coups d'oeil : Calorie Brulé, Calorie Consigné (graph ) ,puis liste glabalo de tout se que tu as manger : sucres, Acide gras, fibre etc etc
- Dans journal pour ajouter de leau on clique le component pour s'hrdater ça nous permet de choisir son contnenant : verre,tasse, bouteile, puis une fois qu'on a choisi on fairt plsu pou savoir combien j'en ai pris et on 
- Dans ajout d'un aliment :Ajout bouton Scan de code-barre pour scanner des produit --> Puis ducoup sauvegarder le produit en nouvelle Aliment

Pas important
- Ajout une NAV Sport : Vos Pas, Séance de sport, Possibilité de renseigner ces perf de sport ?
- Jeune intermitent



