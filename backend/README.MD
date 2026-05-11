# Ymmo Backend

API REST Spring Boot pour la plateforme immobilière Ymmo.

---

## Prérequis

- [Java 17+](https://www.oracle.com/java/technologies/javase/jdk17-archive-downloads.html)
- [Maven 3.8+](https://maven.apache.org/download.cgi)
- [PostgreSQL 14+](https://www.postgresql.org/download/windows/)

---

## 1. Installation de PostgreSQL

### Téléchargement
Rendez-vous sur https://www.postgresql.org/download/windows/ et téléchargez l'installeur.

### Installation
Lancez l'installeur et suivez l'assistant :
- **Port** : laisser `5432` (valeur par défaut)
- **Mot de passe** : choisissez un mot de passe pour l'utilisateur `postgres` — notez-le, vous en aurez besoin
- **Locale** : laisser sur la valeur par défaut

L'installation inclut automatiquement **pgAdmin 4** (interface graphique).

---

## 2. Création de la base de données

### Via pgAdmin 4
1. Ouvrez **pgAdmin 4** depuis le menu Démarrer
2. Dans le panneau gauche : clic droit sur `Databases` → `Create` → `Database`
3. Nommez la base `ymmo` puis cliquez **Save**

### Exécution du script de création
1. Cliquez sur la base `ymmo` dans le panneau gauche
2. Allez dans `Tools` → `Query Tool`
3. Ouvrez le fichier `script.sql` avec le Bloc-notes, copiez tout le contenu
4. Collez dans le Query Tool et appuyez sur **F5**

### Injection des données de test (optionnel)
Répétez l'opération avec le fichier `insert.sql`.

---

## 3. Configuration du projet

### Fichier `.env`
Créez un fichier `.env` à la racine du dossier `backend/` :

```env
DB_URL=jdbc:postgresql://localhost:5432/ymmo
DB_USERNAME=postgres
DB_PASSWORD=votre_mot_de_passe
```


---

## 4. Lancer le projet

```bash
# Se placer dans le dossier backend
cd backend

# Lancer le serveur
mvn clean spring-boot:run
```

Le serveur démarre sur **http://localhost:8080**

---

## 5. Routes disponibles

### Biens immobiliers (`/api/listings`)
| Méthode | Route | Description |
|---------|-------|-------------|
| GET | `/api/listings` | Liste tous les biens |
| GET | `/api/listings/{id}` | Détail d'un bien |
| GET | `/api/listings?city=Paris` | Filtrer par ville |
| GET | `/api/listings?maxPrice=200000` | Filtrer par prix max |
| GET | `/api/listings/agency/{id}` | Biens d'une agence |
| POST | `/api/listings` | Créer un bien |
| PUT | `/api/listings/{id}` | Modifier un bien |
| DELETE | `/api/listings/{id}` | Supprimer un bien |

### Agences (`/api/agencies`)
| Méthode | Route | Description |
|---------|-------|-------------|
| GET | `/api/agencies` | Liste toutes les agences |
| GET | `/api/agencies/{id}` | Détail d'une agence |
| POST | `/api/agencies` | Créer une agence |
| PUT | `/api/agencies/{id}` | Modifier une agence |
| DELETE | `/api/agencies/{id}` | Supprimer une agence |

### Utilisateurs (`/api/users`)
| Méthode | Route | Description |
|---------|-------|-------------|
| GET | `/api/users` | Liste tous les utilisateurs |
| GET | `/api/users/{id}` | Détail d'un utilisateur |
| POST | `/api/users` | Créer un utilisateur |
| PUT | `/api/users/{id}` | Modifier un utilisateur |
| DELETE | `/api/users/{id}` | Supprimer un utilisateur |

### Candidatures (`/api/applications`)
| Méthode | Route | Description |
|---------|-------|-------------|
| GET | `/api/applications` | Liste toutes les candidatures |
| GET | `/api/applications/{id}` | Détail d'une candidature |
| GET | `/api/applications/user/{id}` | Candidatures d'un utilisateur |
| GET | `/api/applications/listing/{id}` | Candidatures d'un bien |
| POST | `/api/applications` | Soumettre une candidature |
| PUT | `/api/applications/{id}` | Modifier une candidature |
| DELETE | `/api/applications/{id}` | Supprimer une candidature |

### Caractéristiques (`/api/features`)
| Méthode | Route | Description |
|---------|-------|-------------|
| GET | `/api/features` | Liste toutes les caractéristiques |
| GET | `/api/features/{id}` | Détail d'une caractéristique |
| POST | `/api/features` | Créer une caractéristique |
| DELETE | `/api/features/{id}` | Supprimer une caractéristique |

### Données de référence (lecture seule)
| Méthode | Route | Description |
|---------|-------|-------------|
| GET | `/api/listing-types` | Types de bien (Vente, Location, Viager) |
| GET | `/api/listing-statuses` | Statuts (Disponible, Vendu, Loué...) |
| GET | `/api/application-statuses` | Statuts de candidature |
| GET | `/api/feature-types` | Types de caractéristiques |
| GET | `/api/roles` | Rôles utilisateurs |

---

## 6. Exemple de requête POST

**Créer un bien** — `POST /api/listings`

```json
{
  "title": "Appartement T3 Paris",
  "description": "Beau appartement lumineux",
  "price": 350000,
  "roomCount": 3,
  "bedroomCount": 2,
  "livingArea": 65.5,
  "energyRating": "B",
  "address": { "id": 1 },
  "type":    { "id": 1 },
  "status":  { "id": 1 },
  "agency":  { "id": 1 }
}
```

> La `publicationDate` est remplie automatiquement avec la date du jour si non fournie.

---

## 7. Structure du projet

```
backend/
├── src/
│   └── main/
│       ├── java/com/ymmo/
│       │   ├── YmmoBackendApplication.java     ← point d'entrée
│       │   ├── controller/                     ← routes HTTP (REST)
│       │   │   ├── AgencyController.java
│       │   │   ├── ListingController.java
│       │   │   ├── UserController.java
│       │   │   ├── ApplicationController.java
│       │   │   ├── FeatureController.java
│       │   │   └── ReferenceController.java
│       │   ├── service/                        ← logique métier
│       │   │   ├── AgencyService.java
│       │   │   ├── ListingService.java
│       │   │   ├── UserService.java
│       │   │   ├── ApplicationService.java
│       │   │   ├── FeatureService.java
│       │   │   └── ReferenceService.java
│       │   ├── repository/                     ← accès base de données (JPA)
│       │   └── model/                          ← entités JPA (15 entités)
│       │       ├── Agency.java
│       │       ├── AgencyAddress.java
│       │       ├── AgencyPicture.java
│       │       ├── Listing.java
│       │       ├── ListingAddress.java
│       │       ├── ListingType.java
│       │       ├── ListingStatus.java
│       │       ├── ListingPicture.java
│       │       ├── Feature.java
│       │       ├── FeatureType.java
│       │       ├── User.java
│       │       ├── Role.java
│       │       ├── Permission.java
│       │       ├── Application.java
│       │       └── ApplicationStatus.java
│       └── resources/
│           └── application.properties          ← configuration Spring
├── script.sql                                  ← schéma de la base de données
├── insert.sql                                  ← données de test
├── .env                                        ← variables d'environnement (à créer)
└── pom.xml                                     ← dépendances Maven
```

---

## 8. Architecture

```
Client (Postman / Frontend)
        ↓  Requête HTTP
   REST Controller        → reçoit et répond aux requêtes HTTP
        ↓
     Service              → logique métier
        ↓
   Repository             → accès base de données (Spring Data JPA)
        ↓
  Base PostgreSQL          → stockage des données
```

---

## 9. Stack technique

| Technologie | Version | Rôle |
|-------------|---------|------|
| Java | 17 | Langage |
| Spring Boot | 3.5.13 | Framework web |
| Spring Data JPA | - | ORM / accès BDD |
| Hibernate | 6.6 | Implémentation JPA |
| PostgreSQL | 17 | Base de données |
| Lombok | - | Réduction du code boilerplate |
| Maven | 3.8+ | Gestion des dépendances |
| Spring Dotenv | 4.0 | Chargement du fichier `.env` |

---

## 10. Modèle de données

Le projet contient **15 tables** organisées autour des entités principales :

- **agencies** — agences immobilières
- **listings** — biens immobiliers (vente, location, viager)
- **users** — utilisateurs (admin, agent, client)
- **applications** — candidatures sur les biens
- **features** — caractéristiques des biens (piscine, jardin, garage...)
- **roles / permissions** — gestion des droits

Les relations entre tables sont modélisées via des annotations JPA :
- `@ManyToOne` pour les clés étrangères simples
- `@ManyToMany` pour les tables de jointure (`features_listings`, `roles_permissions`)
- `@JsonIgnore` pour éviter les boucles de sérialisation JSON
