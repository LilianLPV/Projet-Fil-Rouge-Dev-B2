# Ymmo Backend

API REST Spring Boot pour la plateforme immobilière Ymmo.

---

## Prérequis

- [Java 21+](https://adoptium.net/)
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
3. Ouvrez le fichier `ymmo_database.sql` avec le Bloc-notes, copiez tout le contenu
4. Collez dans le Query Tool et appuyez sur **F5**

### Injection des données de test (optionnel)
Répétez l'opération avec le fichier `ymmo_data_test.sql`.

---

## 3. Configuration du projet

### Fichier `.env`
Créez un fichier `.env` à la racine du projet `backend/` :

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
mvn spring-boot:run
```

Le serveur démarre sur **http://localhost:8080**

---

## 5. Routes disponibles

### Biens immobiliers
| Méthode | Route | Description |
|---------|-------|-------------|
| GET | `/api/biens` | Liste tous les biens |
| GET | `/api/biens/{id}` | Détail d'un bien |
| POST | `/api/biens` | Créer un bien |
| PUT | `/api/biens/{id}` | Modifier un bien |
| DELETE | `/api/biens/{id}` | Supprimer un bien |

### Agences
| Méthode | Route | Description |
|---------|-------|-------------|
| GET | `/api/agencies` | Liste toutes les agences |
| GET | `/api/agencies/{id}` | Détail d'une agence |
| POST | `/api/agencies` | Créer une agence |
| PUT | `/api/agencies/{id}` | Modifier une agence |
| DELETE | `/api/agencies/{id}` | Supprimer une agence |

---

## 6. Structure du projet

```
backend/
├── src/
│   └── main/
│       ├── java/com/ymmo/
│       │   ├── YmmoBackendApplication.java   ← point d'entrée
│       │   ├── controller/                   ← routes HTTP
│       │   ├── service/                      ← logique métier
│       │   ├── repository/                   ← accès base de données
│       │   └── model/                        ← entités JPA
│       └── resources/
│           └── application.properties        ← configuration Spring
├── .env                                      ← variables d'environnement (à créer)
└── pom.xml                                   ← dépendances Maven
```

---

## 7. Stack technique

| Technologie | Version | Rôle |
|-------------|---------|------|
| Java | 21 | Langage |
| Spring Boot | 3.5 | Framework web |
| Spring Data JPA | - | ORM / accès BDD |
| Hibernate | 6.6 | Implémentation JPA |
| PostgreSQL | 17 | Base de données |
| Lombok | - | Réduction du code boilerplate |
| Maven | 3.8+ | Gestion des dépendances |

---
