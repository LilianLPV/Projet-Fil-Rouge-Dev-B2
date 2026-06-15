# YMMO — Frontend (React + Vite)

Single Page Application de la plateforme immobilière YMMO. Consomme l'API Spring Boot (port 8080) et le service d'analyse Python (port 5001).

---

## Stack technique

| Élément | Version / Détail |
|---|---|
| Librairie UI | React 19 |
| Build / Dev server | Vite 8 |
| Styles | Tailwind CSS v4 (`@tailwindcss/vite`) + styles inline |
| Routing | react-router-dom 7 |
| HTTP | axios |
| Graphiques | recharts |
| Lint | ESLint 10 |

---

## Prérequis

- **Node.js 20+**
- Le **backend** lancé sur `http://localhost:8080`
- (Optionnel) le **service Python** sur `http://localhost:5001` pour la page d'analyse

---

## Installation & démarrage

```bash
npm install      # installer les dépendances
npm run dev      # serveur de développement (http://localhost:5173)
```

Autres scripts :

```bash
npm run build    # build de production (dossier dist/)
npm run preview  # prévisualiser le build
npm run lint     # vérifier le code avec ESLint
```

---

## Proxy de développement

Le fichier `vite.config.js` redirige les appels API pour éviter les problèmes de CORS :

| Préfixe | Cible |
|---|---|
| `/api/*` | `http://localhost:8080` (backend Spring Boot) |
| `/analytics-api/*` | `http://localhost:5001` (service Python Flask) |

Les services axios appellent donc des chemins relatifs (`/api/listings`, etc.) sans URL absolue.

---

## Structure du projet

```
frontend/
├── src/
│   ├── main.jsx                 # Point d'entrée React
│   ├── App.jsx                  # Routes (react-router-dom)
│   ├── index.css                # Tokens design + accessibilité + responsive
│   ├── pages/                   # Pages (une par route)
│   ├── components/              # Composants réutilisables
│   ├── api/                     # Couche d'accès HTTP (axios)
│   └── context/
│       └── AuthContext.jsx      # État d'authentification global
├── vite.config.js               # Config Vite + proxy
└── package.json
```

### Pages (`src/pages/`)

| Page | Route | Accès |
|---|---|---|
| `HomePage` | `/` | Public — accueil (hero, sections) |
| `LoginPage` | `/login` | Public — connexion / création de compte |
| `ListingsPage` | `/listings` | Public — grille des biens + filtres |
| `ListingDetailPage` | `/listings/:id` | Public — fiche détaillée + galerie photos + demande de visite |
| `NewListingPage` | `/listings/new` | Agent / Admin — formulaire de publication |
| `AgenciesPage` | `/agencies` | Public — grille des agences |
| `AgencyDetailPage` | `/agencies/:id` | Public — fiche agence + ses biens |
| `MyApplicationsPage` | `/my-applications` | Connecté — mes demandes de visite |
| `AdminApplicationsPage` | `/applications` | Agent / Admin — demandes clients + changement de statut |
| `DashboardPage` | `/dashboard` | Agent / Admin — KPIs + graphiques recharts |
| `AnalyticsPage` | `/analytics` | Admin — analyse Python (graphiques matplotlib) |
| `UsersPage` | `/users` | Admin — gestion des utilisateurs |

### Composants (`src/components/`)

- `Navbar.jsx` — Navigation responsive, liens conditionnés au rôle, accessibilité (skip link, `aria-current`).
- `ListingForm.jsx` — Formulaire de création/édition de bien (construit le payload imbriqué attendu par l'API).
- `StatusBadge.jsx` — Badge coloré selon le statut (bien ou demande).

### Services API (`src/api/`)

| Fichier | Rôle |
|---|---|
| `listingService.js` | CRUD biens |
| `agencyService.js` | CRUD agences |
| `applicationService.js` | Demandes de visite |
| `userService.js` | Utilisateurs |
| `referenceService.js` | Types / statuts de biens |
| `statsService.js` | Statistiques du dashboard |

---

## Authentification & rôles

L'authentification est gérée côté client via **`AuthContext`** et `localStorage` (clé `ymmo_user`).

```jsx
const { currentUser, login, logout, isAdmin, isAgent, isClient } = useAuth()
```

| Rôle | Accès |
|---|---|
| **CLIENT** | Consulter biens/agences, faire des demandes, voir ses demandes |
| **AGENT** | + Publier des biens, voir les demandes clients, dashboard |
| **ADMIN** | + Gérer tous les biens, utilisateurs, analyse Python |

> Le rôle est lu depuis `currentUser.role.roleName`. Les liens de navigation et l'accès aux pages sont conditionnés à ce rôle.

---

## Dashboard — graphiques recharts

La page `DashboardPage` affiche 6 visualisations alimentées par `/api/stats/*` :

| Graphique | Type | Source |
|---|---|---|
| Répartition par type | `PieChart` | `/api/stats/by-type` |
| Biens par statut | `BarChart` | `/api/stats/by-status` |
| Publications par mois | `LineChart` | `/api/stats/listings-by-month` |
| Prix moyen par ville | `BarChart` | `/api/stats/avg-price-by-city` |
| Biens par agence | `BarChart` | `/api/stats/by-agency` |
| Distribution DPE | `BarChart` | `/api/stats/dpe` |

---

## Design System

| Token | Valeur | Usage |
|---|---|---|
| Navy | `#0d1b2a` | Headers, navbar, sections sombres |
| Crème | `#f5f2eb` | Fond principal |
| Or | `#c9a96e` | Accents, CTA, prix |
| Blanc | `#ffffff` | Cartes, formulaires |

**Typographie** : DM Sans (corps) + Playfair Display (titres).
**Responsive** : mobile (< 640px), tablette (640–1024px), desktop (> 1024px).
**Accessibilité** : focus visible, skip link, `prefers-reduced-motion`, labels ARIA (visée WCAG 2.1 AA).

---

*YMMO Frontend — Projet fil rouge B2 DEV — Ynov Campus*
