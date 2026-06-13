# YMMO — Plateforme Immobilière

> Projet fil rouge B2 INFRA & DEV — Ynov Campus  
> Application web full-stack de gestion et consultation de biens immobiliers

---

## Table des matières

1. [Présentation fonctionnelle](#1-présentation-fonctionnelle)
2. [Architecture technique](#2-architecture-technique)
3. [Installation et démarrage](#3-installation-et-démarrage)
4. [Modèle de données](#4-modèle-de-données)
5. [API REST — Endpoints](#5-api-rest--endpoints)
6. [Frontend — Composants clés](#6-frontend--composants-clés)
7. [Script d'analyse Python](#7-script-danalyse-python)
8. [Sécurité et bonnes pratiques](#8-sécurité-et-bonnes-pratiques)
9. [Accessibilité (WCAG 2.1 AA)](#9-accessibilité-wcag-21-aa)
10. [Design System](#10-design-system)

---

## 1. Présentation fonctionnelle

YMMO est une plateforme immobilière qui permet :

| Fonctionnalité | Description |
|---|---|
| **Consultation de biens** | Parcourir, filtrer et rechercher des annonces immobilières |
| **Fiche détaillée** | Voir photos, specs, DPE, prix et informations de l'agence |
| **Demande de visite** | Soumettre une demande de visite/achat sur un bien |
| **Suivi des demandes** | Consulter l'état de ses propres demandes |
| **Gestion des agences** | Consulter les agences partenaires et leurs biens |
| **Dashboard analytique** | Statistiques avancées avec graphiques recharts (ADMIN/AGENT) |
| **Gestion utilisateurs** | CRUD des comptes utilisateur (ADMIN uniquement) |
| **Publication de biens** | Ajouter de nouveaux biens (AGENT/ADMIN) |

### Rôles utilisateurs

| Rôle | Permissions |
|---|---|
| **CLIENT** | Consulter biens, agences, soumettre des demandes, voir ses propres demandes |
| **AGENT** | + Publier et gérer les biens de son agence, accéder au dashboard |
| **ADMIN** | + Gérer tous les biens, toutes les demandes, tous les utilisateurs |

---

## 2. Architecture technique

```
Projet-Fil-Rouge-Dev-B2/
├── backend/          # Spring Boot 3.5 — API REST
├── frontend/         # React 18 + Vite — SPA
└── python/           # Scripts d'analyse de données
```

### Stack

| Couche | Technologies |
|---|---|
| **Frontend** | React 18, Vite, Tailwind CSS v4, react-router-dom v6, axios, recharts |
| **Backend** | Spring Boot 3.5, Java 17, Spring Data JPA, Hibernate 6 |
| **Base de données** | PostgreSQL 15+ |
| **Analyse données** | Python 3.11+, pandas, matplotlib, seaborn, psycopg2 |

---

## 3. Installation et démarrage

### Prérequis

- Java 17+
- Node.js 20+
- PostgreSQL 15+
- Python 3.11+

### Base de données

```sql
CREATE DATABASE ymmo;
CREATE USER ymmo_user WITH PASSWORD 'ymmo_pass';
GRANT ALL PRIVILEGES ON DATABASE ymmo TO ymmo_user;
```

### Backend (Spring Boot)

```bash
cd backend
# Configurer src/main/resources/application.properties :
# spring.datasource.url=jdbc:postgresql://localhost:5432/ymmo
# spring.datasource.username=ymmo_user
# spring.datasource.password=ymmo_pass

./mvnw spring-boot:run
# → Disponible sur http://localhost:8080
```

### Frontend (React + Vite)

```bash
cd frontend
npm install
npm run dev
# → Disponible sur http://localhost:5173
```

Le proxy Vite redirige `/api/*` vers `http://localhost:8080`.

### Script Python

```bash
cd python
pip install -r requirements.txt

# Variables d'environnement (optionnel) :
export DB_HOST=localhost
export DB_PORT=5432
export DB_NAME=ymmo
export DB_USER=postgres
export DB_PASSWORD=postgres

python analyse_ymmo.py
# → Rapports générés dans python/rapports/
```

---

## 4. Modèle de données

### Entités principales

```
┌─────────────┐     ┌──────────────┐     ┌──────────────┐
│   listings  │────▶│   agencies   │     │    users     │
│  id_listing │     │  id_agency   │     │   id_user    │
│  title      │     │  name        │     │  username    │
│  price      │     │  description │     │  email       │
│  living_area│     │  phone       │     │  fk_role     │
│  fk_type    │     │  email       │     │  fk_agency   │
│  fk_status  │     └──────────────┘     └──────────────┘
│  fk_address │
│  fk_agency  │     ┌──────────────────┐
│  energy_    │────▶│   applications   │
│  rating     │     │  id_application  │
└─────────────┘     │  id_listing      │
                    │  id_user         │
                    │  fk_status       │
                    └──────────────────┘
```

### Tables de référence

- `listing_types` — Appartement, Maison, Studio, Loft…
- `listing_statuses` — Disponible, Vendu, Loué, Réservé…
- `application_statuses` — En attente, Acceptée, Refusée…
- `roles` — CLIENT, AGENT, ADMIN
- `listing_addresses` — Adresse complète (rue, ville, code postal)

---

## 5. API REST — Endpoints

### Biens immobiliers `/api/listings`

| Méthode | Endpoint | Description | Auth |
|---|---|---|---|
| GET | `/api/listings` | Liste tous les biens | Public |
| GET | `/api/listings/{id}` | Détail d'un bien | Public |
| POST | `/api/listings` | Créer un bien | AGENT/ADMIN |
| PUT | `/api/listings/{id}` | Modifier un bien | AGENT/ADMIN |
| DELETE | `/api/listings/{id}` | Supprimer un bien | ADMIN |

### Agences `/api/agencies`

| Méthode | Endpoint | Description |
|---|---|---|
| GET | `/api/agencies` | Liste des agences |
| GET | `/api/agencies/{id}` | Détail + biens de l'agence |
| PUT | `/api/agencies/{id}` | Modifier une agence |

### Demandes `/api/applications`

| Méthode | Endpoint | Description |
|---|---|---|
| GET | `/api/applications` | Toutes les demandes |
| GET | `/api/applications/user/{id}` | Demandes d'un utilisateur |
| POST | `/api/applications` | Créer une demande |
| PUT | `/api/applications/{id}` | Changer le statut |

### Statistiques `/api/stats`

| Endpoint | Description |
|---|---|
| GET `/api/stats/kpis` | KPIs globaux (total biens, demandes, agences, prix moyen) |
| GET `/api/stats/by-type` | Nb biens par type |
| GET `/api/stats/by-status` | Nb biens par statut |
| GET `/api/stats/by-agency` | Nb biens par agence |
| GET `/api/stats/avg-price-by-city` | Prix moyen par ville |
| GET `/api/stats/dpe` | Distribution des classes DPE |
| GET `/api/stats/listings-by-month` | Publications par mois (12 derniers mois) |
| GET `/api/stats/top-listings` | Biens les plus demandés |
| GET `/api/stats/price-stats` | Prix min/moy/max par type |

### Requêtes @Query avancées (Spring Data JPA)

```java
// JPQL — Prix moyen par ville (ORDER BY agrégat)
@Query("SELECT l.address.city, AVG(l.price) FROM Listing l " +
       "WHERE l.address.city IS NOT NULL " +
       "GROUP BY l.address.city ORDER BY AVG(l.price) DESC")
List<Object[]> findAvgPriceByCity();

// SQL natif — Prix médian par ville (PERCENTILE_CONT PostgreSQL)
@Query(value = "SELECT a.city, PERCENTILE_CONT(0.5) WITHIN GROUP " +
               "(ORDER BY l.price) as median_price " +
               "FROM listings l JOIN listing_addresses a ON l.fk_address = a.id_address " +
               "WHERE a.city IS NOT NULL GROUP BY a.city " +
               "ORDER BY median_price DESC LIMIT 10",
       nativeQuery = true)
List<Object[]> findMedianPriceByCity();

// JPQL — Biens les plus demandés (JOIN + GROUP BY + COUNT)
@Query("SELECT l.title, l.address.city, l.price, COUNT(a) as nbDemandes " +
       "FROM Application a JOIN a.listing l " +
       "GROUP BY l.id, l.title, l.address.city, l.price " +
       "ORDER BY COUNT(a) DESC")
List<Object[]> findMostRequestedListings();

// SQL natif — Publications par mois (TO_CHAR + INTERVAL)
@Query(value = "SELECT TO_CHAR(publication_date, 'YYYY-MM') as mois, COUNT(*) " +
               "FROM listings WHERE publication_date >= NOW() - INTERVAL '12 months' " +
               "GROUP BY mois ORDER BY mois",
       nativeQuery = true)
List<Object[]> findListingsByMonth();
```

---

## 6. Frontend — Composants clés

### Structure des pages

```
src/
├── pages/
│   ├── HomePage.jsx           # Page d'accueil avec hero et sections
│   ├── LoginPage.jsx          # Split-screen : photo luxe + formulaire
│   ├── ListingsPage.jsx       # Grille de biens avec filtres
│   ├── ListingDetailPage.jsx  # Fiche détaillée + sidebar CTA
│   ├── AgenciesPage.jsx       # Grille des agences partenaires
│   ├── AgencyDetailPage.jsx   # Fiche agence + liste des biens
│   ├── DashboardPage.jsx      # Analytics : KPIs + 6 graphiques recharts
│   ├── MyApplicationsPage.jsx # Demandes de l'utilisateur connecté
│   ├── NewListingPage.jsx     # Formulaire de publication
│   └── UsersPage.jsx          # Gestion des utilisateurs (ADMIN)
├── components/
│   ├── Navbar.jsx             # Navigation responsive sticky + accessibilité
│   ├── ListingCard.jsx        # Carte bien (image, prix, badges)
│   ├── ListingForm.jsx        # Formulaire générique bien
│   └── StatusBadge.jsx        # Badge coloré selon statut
├── api/
│   ├── listingService.js      # CRUD biens
│   ├── agencyService.js       # CRUD agences
│   ├── applicationService.js  # Demandes
│   ├── userService.js         # Utilisateurs
│   └── statsService.js        # Statistiques dashboard
└── context/
    └── AuthContext.jsx        # État d'authentification global
```

### Graphiques recharts (DashboardPage)

| Graphique | Type recharts | Données source |
|---|---|---|
| Répartition par type | `PieChart` | `/api/stats/by-type` |
| Biens par statut | `BarChart` | `/api/stats/by-status` |
| Publications par mois | `LineChart` | `/api/stats/listings-by-month` |
| Prix moyen par ville | `BarChart` (layout vertical) | `/api/stats/avg-price-by-city` |
| Biens par agence | `BarChart` | `/api/stats/by-agency` |
| Distribution DPE | `BarChart` (couleurs A→G) | `/api/stats/dpe` |

---

## 7. Script d'analyse Python

Le script `python/analyse_ymmo.py` se connecte directement à PostgreSQL via **psycopg2** et produit 7 rapports :

| Rapport | Description | Sorties |
|---|---|---|
| **Statistiques descriptives** | Prix moyen, médiane, min, max, écart-type | CSV |
| **Analyse prix par ville** | Comparatif top 10 villes | PNG + CSV |
| **Biens les plus demandés** | Classement par nb de demandes | PNG + CSV |
| **Distribution DPE** | Répartition des classes énergétiques | PNG |
| **Performance agences** | Nb biens et valeur du parc | PNG + CSV |
| **Prévisions de prix** | Régression linéaire + projection 3 mois | PNG + CSV |
| **Dashboard récapitulatif** | 4 graphiques synthétiques | PNG |

### Technologies utilisées

```python
import psycopg2      # Connexion PostgreSQL
import pandas        # Manipulation et analyse de données
import numpy         # Régression linéaire (polyfit)
import matplotlib    # Génération de graphiques PNG
import seaborn       # Styles visuels
from tabulate import tabulate  # Tableaux formatés console
```

### Configuration via variables d'environnement

```bash
DB_HOST=localhost DB_PORT=5432 DB_NAME=ymmo \
DB_USER=postgres DB_PASSWORD=postgres \
python analyse_ymmo.py
```

---

## 8. Sécurité et bonnes pratiques

- **Authentification** : Basée sur `localStorage` — userId, username, role
- **Autorisations** : `AuthContext` (isAdmin, isAgent) + redirection protégée
- **CORS** : `@CrossOrigin(origins = "*")` — à restreindre en production
- **Validation JPA** : `@NotNull`, `@Size`, contraintes de clés étrangères
- **POO Java** : Héritage (`@ManyToOne`), encapsulation (Lombok), interfaces JPA
- **Conventions** : camelCase Java, PascalCase React, snake_case SQL

---

## 9. Accessibilité (WCAG 2.1 AA)

| Critère WCAG | Implémentation |
|---|---|
| **1.1.1 Texte alternatif** | `alt=""` décoratif, `aria-hidden="true"` sur icônes SVG |
| **1.3.1 Information et relations** | `<header>`, `<main>`, `<nav>` avec landmarks ARIA |
| **2.1.1 Clavier** | Focus visible, skip link, `tabIndex="-1"` sur main |
| **2.4.3 Ordre du focus** | Navigation logique, `aria-current="page"` |
| **2.4.6 En-têtes** | Hiérarchie h1→h3 cohérente |
| **3.3.1 Erreurs** | `role="alert"` + `aria-live="polite"` |
| **4.1.2 Nom, rôle, valeur** | `aria-label` sur boutons, `scope="col"` sur tableaux |

---

## 10. Design System

### Palette de couleurs (Figma YMMO exact)

| Token CSS | Valeur | Usage |
|---|---|---|
| `--navy` | `#0d1b2a` | Headers, navbar, sections sombres |
| `--cream` | `#f5f2eb` | Fond principal des pages |
| `--card` | `#ffffff` | Fond des cartes et formulaires |
| `--gold` | `#c9a96e` | Accent, CTA, prix, icônes |
| `--text-dark` | `#0d1b2a` | Corps de texte sur fond clair |
| `--text-mid` | `#6b6355` | Texte secondaire, placeholders |
| `--text-light` | `#f5f2eb` | Texte sur fond sombre |

### Typographie

| Famille | Usage | Poids |
|---|---|---|
| **DM Sans** | Corps, labels, boutons, UI | 300, 400, 500, 600, 700 |
| **Playfair Display** | Titres, prix, accents luxe | 400, 500, 600, 700, italic |

### Breakpoints responsive

| Breakpoint | Largeur | Grille listings | Comportement |
|---|---|---|---|
| Mobile | < 640px | 1 colonne | Padding 16px, nav masquée |
| Tablet | 640–1024px | 2 colonnes | Layout adapté |
| Desktop | > 1024px | 3–4 colonnes | Layout complet |

---

*Documentation YMMO — B2 DEV Ynov Campus — Juin 2026*
