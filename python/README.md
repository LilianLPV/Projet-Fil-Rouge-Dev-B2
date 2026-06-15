# YMMO — Analyse de données (Python)

Module d'analyse de données immobilières du projet YMMO. Il existe **deux façons** d'exécuter l'analyse :

1. **`app.py`** — serveur Flask (port 5001) qui alimente la page « Analyse Python » du frontend.
2. **`analyse_ymmo.py`** — script CLI autonome qui génère des rapports en local.

Les deux produisent des graphiques `matplotlib` / `seaborn` dans le dossier `rapports/`.

---

## Stack technique

| Librairie | Rôle |
|---|---|
| Flask + flask-cors | Serveur web (`app.py`) |
| pandas / numpy | Manipulation et analyse de données |
| matplotlib / seaborn | Génération des graphiques PNG |
| psycopg2-binary | Connexion PostgreSQL (`analyse_ymmo.py`) |
| requests | Appels à l'API Spring Boot (`app.py`) |
| tabulate | Tableaux formatés en console |

---

## Prérequis

- **Python 3.11+**
- Dépendances installées :

```bash
pip install -r requirements.txt
```

---

## Option 1 — Serveur Flask (`app.py`)

Utilisé par la page **Analyse Python** du frontend (admin). Il **ne se connecte pas directement à PostgreSQL** : il récupère les données via l'API Spring Boot (`/api/stats/*`), ce qui évite les problèmes d'encodage Windows.

### Prérequis
Le **backend Spring Boot doit tourner** sur `http://localhost:8080`.

### Lancement
```bash
python app.py
# → Serveur sur http://localhost:5001
# → L'analyse démarre automatiquement en arrière-plan
```

### Routes exposées
| Route | Description |
|---|---|
| `GET /status` | État de l'analyse (`pending` / `running` / `done` / `error`) |
| `GET /summary` | Résumé JSON (KPIs, répartitions, tendance) |
| `GET /images` | Liste des graphiques disponibles |
| `GET /images/<nom>.png` | Récupère un graphique |
| `POST /refresh` | Relance l'analyse |

> Le frontend y accède via le proxy Vite `/analytics-api/*` → `http://localhost:5001`.

### Variable d'environnement
```bash
SPRING_URL=http://localhost:8080/api  # URL de base de l'API (défaut)
```

---

## Option 2 — Script CLI autonome (`analyse_ymmo.py`)

Se connecte **directement à PostgreSQL** via psycopg2 et génère des rapports (graphiques PNG + exports CSV).

### Lancement
```bash
python analyse_ymmo.py
```

### Configuration (variables d'environnement)
```bash
DB_HOST=localhost \
DB_PORT=5432 \
DB_NAME=ymmo \
DB_USER=postgres \
DB_PASSWORD=VOTRE_MOT_DE_PASSE \
python analyse_ymmo.py
```

(valeurs par défaut entre parenthèses : `localhost`, `5432`, `ymmo`, `postgres`, `postgres`)

### Rapports produits
1. Statistiques descriptives (prix, surface, DPE…)
2. Analyse des biens les plus demandés
3. Prévision de tendances par ville (régression linéaire `numpy.polyfit`)
4. Performance par agence
5. Distribution des classes DPE
6. Export CSV des rapports

---

## Graphiques générés (`rapports/`)

| Fichier | Contenu |
|---|---|
| `prix_par_ville.png` | Prix moyen par ville (top 10) |
| `types_biens.png` | Répartition par type (camembert) |
| `distribution_dpe.png` | Distribution des classes DPE |
| `biens_par_agence.png` | Nombre de biens par agence |
| `tendance_prix.png` | Publications par mois + droite de tendance |
| `dashboard_recap.png` | Synthèse 4-en-1 |

Les graphiques utilisent la charte YMMO (fond navy `#0d1b2a`, accent or `#c9a96e`).

---

## Structure

```
python/
├── app.py              # Serveur Flask (alimente le frontend)
├── analyse_ymmo.py     # Script CLI autonome (connexion directe BDD)
├── requirements.txt    # Dépendances Python
└── rapports/           # Graphiques PNG générés
```

---

*YMMO Python — Projet fil rouge B2 DEV — Ynov Campus*
