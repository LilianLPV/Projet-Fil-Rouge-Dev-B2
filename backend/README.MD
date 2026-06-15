# YMMO — Backend (Spring Boot)

API REST de la plateforme immobilière YMMO. Expose les biens, agences, utilisateurs, demandes de visite et les statistiques consommées par le frontend React et le service d'analyse Python.

---

## Stack technique

| Élément | Version / Détail |
|---|---|
| Langage | Java 17 |
| Framework | Spring Boot 3.5.13 |
| Accès données | Spring Data JPA / Hibernate 6 |
| Base de données | PostgreSQL (driver 42.7.3) |
| Build | Maven (`spring-boot-maven-plugin`) |
| Confort dev | Spring Boot DevTools (rechargement à chaud) |
| Boilerplate | Lombok (`@Data`, constructeurs) |
| Config | `spring-dotenv` (support fichier `.env`) |

> ⚠️ Spring Security est volontairement **désactivé** (`SecurityAutoConfiguration` exclue dans `application.properties`). L'authentification est gérée côté frontend (voir README frontend).

---

## Prérequis

- **JDK 17+**
- **PostgreSQL 15+** avec une base `ymmo` créée
- Maven (ou le wrapper `mvnw` fourni)

---

## Installation & démarrage

### 1. Créer la base de données

```sql
CREATE DATABASE ymmo;
```

### 2. Charger le schéma et les données

```bash
# Schéma (tables, contraintes)
psql -U postgres -d ymmo -f script.sql

# Données de démonstration (agences, biens, utilisateurs, photos…)
psql -U postgres -d ymmo -f insert.sql
```

### 3. Configurer la connexion

Édite `src/main/resources/application.properties` :

```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/ymmo
spring.datasource.username=postgres
spring.datasource.password=VOTRE_MOT_DE_PASSE
spring.jpa.hibernate.ddl-auto=validate
```

> `ddl-auto=validate` : Hibernate **vérifie** que le schéma correspond aux entités mais ne le modifie pas. Le schéma doit donc être créé au préalable via `script.sql`.

### 4. Lancer le serveur

```bash
mvn spring-boot:run
# ou avec le wrapper :
./mvnw spring-boot:run
```

API disponible sur **http://localhost:8080**.

---

## Structure du projet

```
backend/
├── src/main/java/com/ymmo/
│   ├── YmmoBackendApplication.java   # Point d'entrée Spring Boot
│   ├── model/          # Entités JPA (Listing, Agency, User, Application…)
│   ├── repository/     # Interfaces Spring Data JPA + requêtes @Query
│   ├── service/        # Logique métier (résolution des références, défauts…)
│   └── controller/     # Contrôleurs REST (@RestController)
├── src/main/resources/
│   └── application.properties
├── script.sql          # Création du schéma (DDL)
├── insert.sql          # Données de démonstration (DML)
└── pom.xml
```

### Couches

- **model** — Entités annotées JPA (`@Entity`, `@ManyToOne`, `@OneToMany`…). Lombok `@Data` génère getters/setters.
- **repository** — `JpaRepository<T, Integer>` + méthodes dérivées et requêtes `@Query` (JPQL et SQL natif).
- **service** — Recharge les entités liées depuis la BDD avant sauvegarde (évite les références transientes), applique les valeurs par défaut (rôle CLIENT, statut « En attente », date de publication…).
- **controller** — Mappe les routes HTTP. `@CrossOrigin(origins = "*")` pour autoriser le frontend.

---

## Endpoints REST

### Biens — `/api/listings`
| Méthode | Endpoint | Description |
|---|---|---|
| GET | `/api/listings` | Liste des biens (filtres `?city=` ou `?maxPrice=`) |
| GET | `/api/listings/{id}` | Détail d'un bien (avec galerie photos) |
| GET | `/api/listings/agency/{agencyId}` | Biens d'une agence |
| POST | `/api/listings` | Créer un bien |
| PUT | `/api/listings/{id}` | Modifier un bien |
| DELETE | `/api/listings/{id}` | Supprimer un bien |

### Agences — `/api/agencies`
| Méthode | Endpoint | Description |
|---|---|---|
| GET | `/api/agencies` | Liste des agences |
| GET | `/api/agencies/{id}` | Détail d'une agence |
| POST / PUT / DELETE | `/api/agencies/{id}` | CRUD agence |

### Utilisateurs — `/api/users`
| Méthode | Endpoint | Description |
|---|---|---|
| GET | `/api/users` | Liste des utilisateurs |
| GET | `/api/users/{id}` | Détail |
| POST | `/api/users` | Créer un compte (rôle CLIENT par défaut) |
| PUT | `/api/users/{id}` | Modifier (conserve le mot de passe si non fourni) |
| DELETE | `/api/users/{id}` | Supprimer |

### Demandes de visite — `/api/applications`
| Méthode | Endpoint | Description |
|---|---|---|
| GET | `/api/applications` | Toutes les demandes |
| GET | `/api/applications/user/{userId}` | Demandes d'un client |
| GET | `/api/applications/listing/{listingId}` | Demandes sur un bien |
| POST | `/api/applications` | Créer une demande (statut « En attente ») |
| PUT | `/api/applications/{id}` | Changer le statut (Acceptée / Refusée…) |
| DELETE | `/api/applications/{id}` | Supprimer |

### Données de référence — `/api`
| Méthode | Endpoint | Description |
|---|---|---|
| GET | `/api/listing-types` | Types de biens |
| GET | `/api/listing-statuses` | Statuts de biens |
| GET | `/api/features` | Équipements |

### Statistiques — `/api/stats`
| Endpoint | Description |
|---|---|
| `/api/stats/kpis` | KPIs globaux (total biens, demandes, agences, prix moyen) |
| `/api/stats/by-type` | Nb de biens par type |
| `/api/stats/by-status` | Nb de biens par statut |
| `/api/stats/by-agency` | Nb de biens par agence |
| `/api/stats/avg-price-by-city` | Prix moyen par ville |
| `/api/stats/dpe` | Distribution des classes DPE |
| `/api/stats/listings-by-month` | Publications sur 12 mois |
| `/api/stats/top-listings` | Biens les plus demandés |
| `/api/stats/price-stats` | Prix min / moyen / max par type |

---

## Requêtes @Query notables

Le repository `ListingRepository` combine **JPQL** et **SQL natif PostgreSQL** :

```java
// JPQL — prix moyen par ville
@Query("SELECT l.address.city, AVG(l.price) FROM Listing l " +
       "WHERE l.address.city IS NOT NULL GROUP BY l.address.city")
List<Object[]> findAvgPriceByCity();

// SQL natif — prix médian (fonction PostgreSQL PERCENTILE_CONT)
@Query(value = "SELECT a.city, PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY l.price) " +
               "FROM listings l JOIN listing_address a ON l.fk_address = a.id_address " +
               "GROUP BY a.city", nativeQuery = true)
List<Object[]> findMedianPriceByCity();

// SQL natif — publications par mois (TO_CHAR + INTERVAL)
@Query(value = "SELECT TO_CHAR(publication_date, 'YYYY-MM'), COUNT(*) FROM listings " +
               "WHERE publication_date >= NOW() - INTERVAL '12 months' " +
               "GROUP BY 1 ORDER BY 1", nativeQuery = true)
List<Object[]> findListingsByMonth();
```

---

## Notes & bonnes pratiques

- **Mot de passe** : le champ `password` du modèle `User` utilise `@JsonProperty(access = WRITE_ONLY)` — il est accepté en entrée (création) mais **jamais renvoyé** dans les réponses JSON.
- **Références imbriquées** : à la sauvegarde, les services rechargent les entités liées (type, statut, agence, listing…) depuis la BDD à partir de leur `id` pour éviter l'erreur Hibernate « not-null property references a null or transient value ».
- **CORS** : `origins = "*"` en développement — à restreindre au domaine du frontend en production.
- **Secrets** : le mot de passe BDD est en clair dans `application.properties`. En production, utiliser un fichier `.env` (support `spring-dotenv` déjà inclus) ou des variables d'environnement.

---

*YMMO Backend — Projet fil rouge B2 DEV — Ynov Campus*
