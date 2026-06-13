"""
╔══════════════════════════════════════════════════════════════════╗
║            YMMO — Analyse de données immobilières                ║
║         Script Python — Données & Intelligence Artificielle      ║
╚══════════════════════════════════════════════════════════════════╝

Ce script se connecte à la base de données PostgreSQL YMMO et produit :
  1. Rapport de statistiques descriptives (prix, surface, DPE…)
  2. Analyse des biens les plus demandés
  3. Prévision de tendances par ville (régression linéaire simple)
  4. Rapport de performance par agence
  5. Analyse de la distribution DPE
  6. Export CSV des rapports

Prérequis :
  pip install -r requirements.txt

Configuration :
  Modifier la section CONFIG ci-dessous selon votre environnement.
"""

import os
import sys
import warnings
import psycopg2
import pandas as pd
import numpy as np
import matplotlib
matplotlib.use('Agg')   # Mode non-interactif (pas d'affichage GUI)
import matplotlib.pyplot as plt
import matplotlib.patches as mpatches
import seaborn as sns
from tabulate import tabulate
from datetime import datetime

warnings.filterwarnings('ignore')

# ─── CONFIGURATION ──────────────────────────────────────────────────────────
CONFIG = {
    "host":     os.getenv("DB_HOST",     "localhost"),
    "port":     os.getenv("DB_PORT",     "5432"),
    "dbname":   os.getenv("DB_NAME",     "ymmo"),
    "user":     os.getenv("DB_USER",     "postgres"),
    "password": os.getenv("DB_PASSWORD", "postgres"),
}

OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "rapports")
os.makedirs(OUTPUT_DIR, exist_ok=True)

# ─── COULEURS YMMO ──────────────────────────────────────────────────────────
NAVY   = "#0d1b2a"
GOLD   = "#c9a96e"
CREAM  = "#f5f2eb"
COLORS = [GOLD, "#1a2e45", "#3d5a80", "#e07b4a", "#6b4f8a", "#2e7d5a", "#8b4513"]

DPE_COLORS = {
    "A": "#22c55e", "B": "#84cc16", "C": "#eab308",
    "D": "#f97316", "E": "#ef4444", "F": "#dc2626", "G": "#7f1d1d"
}

# ─── CONNEXION BDD ───────────────────────────────────────────────────────────
def connect():
    try:
        conn = psycopg2.connect(**CONFIG, options="-c client_encoding=UTF8")
        print("✅ Connexion PostgreSQL établie")
        return conn
    except Exception as e:
        print(f"❌ Impossible de se connecter : {e}")
        print("   → Vérifiez que PostgreSQL est démarré et que la config est correcte.")
        sys.exit(1)


# ─── CHARGEMENT DES DONNÉES ──────────────────────────────────────────────────
def load_data(conn):
    """Charge toutes les tables nécessaires dans des DataFrames pandas."""

    query_listings = """
        SELECT
            l.id_listing            AS id,
            l.title                 AS titre,
            l.price                 AS prix,
            l.living_area           AS surface,
            l.room_count            AS pieces,
            l.bedroom_count         AS chambres,
            l.energy_rating         AS dpe,
            l.publication_date      AS date_publication,
            lt.label                AS type_bien,
            ls.label                AS statut,
            la.city                 AS ville,
            la.zip_code             AS code_postal,
            ag.name                 AS agence
        FROM listings l
        LEFT JOIN listing_types lt    ON l.fk_type    = lt.id_type
        LEFT JOIN listing_statuses ls ON l.fk_status  = ls.id_status
        LEFT JOIN listing_addresses la ON l.fk_address = la.id_address
        LEFT JOIN agencies ag         ON l.fk_agency  = ag.id_agency
    """

    query_applications = """
        SELECT
            a.id_application        AS id,
            a.id_listing            AS listing_id,
            a.id_user               AS user_id,
            aps.label               AS statut,
            l.price                 AS prix_bien,
            lt.label                AS type_bien,
            la.city                 AS ville,
            ag.name                 AS agence
        FROM applications a
        LEFT JOIN application_statuses aps ON a.fk_status   = aps.id_status
        LEFT JOIN listings l               ON a.id_listing   = l.id_listing
        LEFT JOIN listing_types lt         ON l.fk_type      = lt.id_type
        LEFT JOIN listing_addresses la     ON l.fk_address   = la.id_address
        LEFT JOIN agencies ag              ON l.fk_agency    = ag.id_agency
    """

    listings     = pd.read_sql(query_listings,     conn)
    applications = pd.read_sql(query_applications, conn)

    # Conversions de types
    listings["prix"]             = pd.to_numeric(listings["prix"],    errors="coerce")
    listings["surface"]          = pd.to_numeric(listings["surface"], errors="coerce")
    listings["date_publication"] = pd.to_datetime(listings["date_publication"], errors="coerce")

    print(f"📊 {len(listings)} biens chargés — {len(applications)} demandes chargées")
    return listings, applications


# ─── RAPPORT 1 : Statistiques descriptives ───────────────────────────────────
def rapport_statistiques(listings, applications):
    print("\n" + "═"*60)
    print("  RAPPORT 1 — Statistiques descriptives")
    print("═"*60)

    stats = listings["prix"].describe()
    print(tabulate([
        ["Nombre de biens",   f"{int(stats['count'])}"],
        ["Prix moyen",        f"{stats['mean']:,.0f} €"],
        ["Prix médian",       f"{stats['50%']:,.0f} €"],
        ["Prix minimum",      f"{stats['min']:,.0f} €"],
        ["Prix maximum",      f"{stats['max']:,.0f} €"],
        ["Écart-type",        f"{stats['std']:,.0f} €"],
    ], headers=["Indicateur", "Valeur"], tablefmt="rounded_outline"))

    # Répartition par type
    print("\n📦 Répartition par type de bien :")
    type_counts = listings["type_bien"].value_counts()
    print(tabulate(
        [(t, c, f"{c/len(listings)*100:.1f}%") for t, c in type_counts.items()],
        headers=["Type", "Nb biens", "Part (%)"],
        tablefmt="rounded_outline"
    ))

    # Répartition par statut
    print("\n📋 Répartition par statut :")
    statut_counts = listings["statut"].value_counts()
    print(tabulate(
        [(s, c, f"{c/len(listings)*100:.1f}%") for s, c in statut_counts.items()],
        headers=["Statut", "Nb biens", "Part (%)"],
        tablefmt="rounded_outline"
    ))

    # Export CSV
    listings.describe().to_csv(f"{OUTPUT_DIR}/stats_descriptives.csv")
    print(f"\n💾 Export → rapports/stats_descriptives.csv")


# ─── RAPPORT 2 : Prix par ville ───────────────────────────────────────────────
def rapport_prix_villes(listings):
    print("\n" + "═"*60)
    print("  RAPPORT 2 — Analyse des prix par ville")
    print("═"*60)

    villes = (
        listings.groupby("ville")["prix"]
        .agg(["mean", "median", "count", "min", "max"])
        .rename(columns={"mean":"Moy (€)", "median":"Méd (€)", "count":"Nb", "min":"Min (€)", "max":"Max (€)"})
        .sort_values("Moy (€)", ascending=False)
        .head(15)
    )
    villes["Moy (€)"]  = villes["Moy (€)"].map("{:,.0f}".format)
    villes["Méd (€)"]  = villes["Méd (€)"].map("{:,.0f}".format)
    villes["Min (€)"]  = villes["Min (€)"].map("{:,.0f}".format)
    villes["Max (€)"]  = villes["Max (€)"].map("{:,.0f}".format)
    print(tabulate(villes.reset_index(), headers="keys", tablefmt="rounded_outline", showindex=False))

    # Graphique prix moyen par ville
    data = (
        listings.groupby("ville")["prix"]
        .mean()
        .sort_values(ascending=False)
        .head(10)
    )
    fig, ax = plt.subplots(figsize=(12, 5))
    fig.patch.set_facecolor(NAVY)
    ax.set_facecolor(NAVY)
    bars = ax.barh(data.index[::-1], data.values[::-1], color=GOLD, edgecolor="none", height=0.6)
    ax.set_xlabel("Prix moyen (€)", color=CREAM, fontsize=11)
    ax.set_title("Prix moyen par ville — Top 10", color=CREAM, fontsize=14, pad=15, fontweight="bold")
    ax.tick_params(colors=CREAM)
    for spine in ax.spines.values():
        spine.set_edgecolor("#1a2e45")
    for bar, val in zip(bars, data.values[::-1]):
        ax.text(bar.get_width() + 5000, bar.get_y() + bar.get_height()/2,
                f"{val:,.0f} €", va="center", color=CREAM, fontsize=9)
    plt.tight_layout()
    plt.savefig(f"{OUTPUT_DIR}/prix_par_ville.png", dpi=150, bbox_inches="tight",
                facecolor=NAVY)
    plt.close()
    print(f"📊 Graphique → rapports/prix_par_ville.png")

    # Export CSV
    listings.groupby("ville")["prix"].describe().to_csv(f"{OUTPUT_DIR}/prix_par_ville.csv")
    print(f"💾 Export → rapports/prix_par_ville.csv")


# ─── RAPPORT 3 : Biens les plus demandés ──────────────────────────────────────
def rapport_biens_populaires(listings, applications):
    print("\n" + "═"*60)
    print("  RAPPORT 3 — Biens les plus demandés")
    print("═"*60)

    if applications.empty:
        print("⚠️  Aucune demande en base de données.")
        return

    demandes = (
        applications.groupby("listing_id")
        .size()
        .reset_index(name="nb_demandes")
        .merge(
            listings[["id","titre","ville","prix","type_bien","agence"]],
            left_on="listing_id", right_on="id",
            how="left"
        )
        .sort_values("nb_demandes", ascending=False)
        .head(10)
    )

    print(tabulate(
        demandes[["titre","ville","prix","type_bien","nb_demandes"]].values,
        headers=["Titre", "Ville", "Prix (€)", "Type", "Demandes"],
        tablefmt="rounded_outline"
    ))

    # Taux de conversion par agence
    print("\n🏢 Demandes par agence :")
    agence_stats = applications.groupby("agence").size().sort_values(ascending=False)
    print(tabulate(
        [(ag, nb) for ag, nb in agence_stats.items()],
        headers=["Agence", "Nb demandes"],
        tablefmt="rounded_outline"
    ))

    # Graphique
    fig, ax = plt.subplots(figsize=(10, 5))
    fig.patch.set_facecolor(NAVY)
    ax.set_facecolor(NAVY)
    top = demandes.head(8)
    ax.bar(range(len(top)), top["nb_demandes"], color=GOLD, edgecolor="none")
    ax.set_xticks(range(len(top)))
    labels = [str(t)[:22]+"…" if len(str(t)) > 22 else str(t) for t in top["titre"]]
    ax.set_xticklabels(labels, rotation=35, ha="right", color=CREAM, fontsize=8)
    ax.set_ylabel("Nombre de demandes", color=CREAM)
    ax.set_title("Top biens les plus demandés", color=CREAM, fontsize=14, fontweight="bold", pad=12)
    ax.tick_params(colors=CREAM)
    for spine in ax.spines.values():
        spine.set_edgecolor("#1a2e45")
    plt.tight_layout()
    plt.savefig(f"{OUTPUT_DIR}/biens_populaires.png", dpi=150, bbox_inches="tight", facecolor=NAVY)
    plt.close()
    print(f"📊 Graphique → rapports/biens_populaires.png")

    demandes.to_csv(f"{OUTPUT_DIR}/biens_populaires.csv", index=False)
    print(f"💾 Export → rapports/biens_populaires.csv")


# ─── RAPPORT 4 : Distribution DPE ────────────────────────────────────────────
def rapport_dpe(listings):
    print("\n" + "═"*60)
    print("  RAPPORT 4 — Distribution des notes DPE")
    print("═"*60)

    dpe = listings[listings["dpe"].notna() & (listings["dpe"] != "")]
    if dpe.empty:
        print("⚠️  Aucune donnée DPE disponible.")
        return

    dpe_counts = dpe["dpe"].value_counts().sort_index()
    print(tabulate(
        [(k, v, f"{v/len(dpe)*100:.1f}%") for k, v in dpe_counts.items()],
        headers=["Classe DPE", "Nb biens", "Part (%)"],
        tablefmt="rounded_outline"
    ))

    fig, ax = plt.subplots(figsize=(8, 5))
    fig.patch.set_facecolor(NAVY)
    ax.set_facecolor(NAVY)
    keys = [k for k in dpe_counts.index if k in DPE_COLORS]
    vals = [dpe_counts[k] for k in keys]
    colors = [DPE_COLORS[k] for k in keys]
    bars = ax.bar(keys, vals, color=colors, edgecolor="none", width=0.6)
    for bar, val in zip(bars, vals):
        ax.text(bar.get_x() + bar.get_width()/2, bar.get_height() + 0.1,
                str(val), ha="center", color=CREAM, fontsize=10, fontweight="bold")
    ax.set_xlabel("Classe DPE", color=CREAM, fontsize=11)
    ax.set_ylabel("Nombre de biens", color=CREAM, fontsize=11)
    ax.set_title("Distribution des classes DPE", color=CREAM, fontsize=14, fontweight="bold", pad=12)
    ax.tick_params(colors=CREAM)
    for spine in ax.spines.values():
        spine.set_edgecolor("#1a2e45")
    plt.tight_layout()
    plt.savefig(f"{OUTPUT_DIR}/distribution_dpe.png", dpi=150, bbox_inches="tight", facecolor=NAVY)
    plt.close()
    print(f"📊 Graphique → rapports/distribution_dpe.png")


# ─── RAPPORT 5 : Performance par agence ──────────────────────────────────────
def rapport_agences(listings, applications):
    print("\n" + "═"*60)
    print("  RAPPORT 5 — Performance par agence")
    print("═"*60)

    agence_stats = (
        listings.groupby("agence")
        .agg(
            nb_biens   = ("id", "count"),
            prix_moyen = ("prix", "mean"),
            prix_total = ("prix", "sum"),
        )
        .sort_values("nb_biens", ascending=False)
    )
    agence_stats["prix_moyen"] = agence_stats["prix_moyen"].map("{:,.0f} €".format)
    agence_stats["prix_total"] = agence_stats["prix_total"].map("{:,.0f} €".format)
    print(tabulate(
        agence_stats.reset_index().values,
        headers=["Agence", "Nb biens", "Prix moyen", "Valeur totale du parc"],
        tablefmt="rounded_outline"
    ))

    # Graphique camembert
    nb = listings.groupby("agence")["id"].count().sort_values(ascending=False).head(8)
    fig, ax = plt.subplots(figsize=(9, 6))
    fig.patch.set_facecolor(NAVY)
    ax.set_facecolor(NAVY)
    wedges, texts, autotexts = ax.pie(
        nb, labels=nb.index,
        colors=COLORS[:len(nb)],
        autopct="%1.1f%%", startangle=90,
        textprops={"color": CREAM, "fontsize": 9},
        wedgeprops={"edgecolor": NAVY, "linewidth": 2}
    )
    for at in autotexts:
        at.set_color(NAVY)
        at.set_fontweight("bold")
    ax.set_title("Répartition des biens par agence", color=CREAM, fontsize=14,
                 fontweight="bold", pad=12)
    plt.tight_layout()
    plt.savefig(f"{OUTPUT_DIR}/performance_agences.png", dpi=150, bbox_inches="tight", facecolor=NAVY)
    plt.close()
    print(f"📊 Graphique → rapports/performance_agences.png")

    agence_stats.to_csv(f"{OUTPUT_DIR}/performance_agences.csv")
    print(f"💾 Export → rapports/performance_agences.csv")


# ─── RAPPORT 6 : Prévisions — Tendance prix ──────────────────────────────────
def rapport_tendances(listings):
    print("\n" + "═"*60)
    print("  RAPPORT 6 — Tendances et prévisions de prix")
    print("═"*60)

    df = listings.dropna(subset=["date_publication", "prix"]).copy()
    if df.empty or len(df) < 3:
        print("⚠️  Données insuffisantes pour la régression.")
        return

    df["mois"]       = df["date_publication"].dt.to_period("M")
    df["mois_num"]   = (df["date_publication"].dt.year * 12 +
                        df["date_publication"].dt.month)
    df["mois_label"] = df["date_publication"].dt.strftime("%b %Y")

    monthly = df.groupby(["mois_num", "mois_label"])["prix"].mean().reset_index()
    monthly.columns = ["mois_num", "mois_label", "prix_moyen"]
    monthly = monthly.sort_values("mois_num")

    if len(monthly) < 2:
        print("⚠️  Pas assez de mois pour calculer une tendance.")
        return

    # Régression linéaire simple (numpy)
    x = monthly["mois_num"].values
    y = monthly["prix_moyen"].values
    coeffs = np.polyfit(x, y, 1)
    poly   = np.poly1d(coeffs)

    # Prévision sur 3 mois
    x_future = np.array([x[-1] + 1, x[-1] + 2, x[-1] + 3])
    y_future = poly(x_future)

    tendance = "hausse 📈" if coeffs[0] > 0 else "baisse 📉"
    variation = abs(coeffs[0])
    print(f"  Tendance générale   : {tendance}")
    print(f"  Variation mensuelle : {variation:+,.0f} €/mois")
    print(f"\n  Prévisions :")
    from datetime import date
    from dateutil.relativedelta import relativedelta
    now = date.today()
    for i, (fx, fy) in enumerate(zip(x_future, y_future), 1):
        mois = (now + relativedelta(months=i)).strftime("%B %Y")
        print(f"    • {mois} → {fy:,.0f} €")

    # Graphique
    fig, ax = plt.subplots(figsize=(12, 5))
    fig.patch.set_facecolor(NAVY)
    ax.set_facecolor(NAVY)
    ax.plot(range(len(monthly)), monthly["prix_moyen"], "o-",
            color=GOLD, linewidth=2.5, markersize=6, label="Prix moyen réel")
    x_fit = np.linspace(0, len(monthly) + 3, 100)
    x_months = x[0] + x_fit * (x[-1] - x[0]) / (len(monthly) - 1 + 3)
    ax.plot(x_fit, poly(x_months), "--", color="#e07b4a",
            linewidth=1.5, alpha=0.8, label="Tendance (régression)")
    # Points prévision
    ax.plot([len(monthly), len(monthly)+1, len(monthly)+2],
            y_future[:3], "D", color="#ef4444",
            markersize=8, label="Prévisions", zorder=5)
    ax.set_xticks(range(len(monthly)))
    ax.set_xticklabels(monthly["mois_label"], rotation=45, ha="right", color=CREAM, fontsize=7)
    ax.set_ylabel("Prix moyen (€)", color=CREAM)
    ax.set_title("Évolution du prix moyen et prévisions", color=CREAM,
                 fontsize=14, fontweight="bold", pad=12)
    ax.tick_params(colors=CREAM)
    ax.legend(facecolor=NAVY, edgecolor="#1a2e45", labelcolor=CREAM)
    for spine in ax.spines.values():
        spine.set_edgecolor("#1a2e45")
    plt.tight_layout()
    plt.savefig(f"{OUTPUT_DIR}/tendances_prix.png", dpi=150, bbox_inches="tight", facecolor=NAVY)
    plt.close()
    print(f"\n📊 Graphique → rapports/tendances_prix.png")

    monthly.to_csv(f"{OUTPUT_DIR}/tendances_prix.csv", index=False)
    print(f"💾 Export → rapports/tendances_prix.csv")


# ─── RAPPORT 7 : Tableau de bord récapitulatif ───────────────────────────────
def rapport_dashboard(listings, applications):
    print("\n" + "═"*60)
    print("  RAPPORT 7 — Tableau de bord récapitulatif")
    print("═"*60)

    fig, axes = plt.subplots(2, 2, figsize=(14, 9))
    fig.patch.set_facecolor(NAVY)
    fig.suptitle("YMMO — Tableau de bord analytique", color=CREAM,
                 fontsize=16, fontweight="bold", y=1.01)

    for ax in axes.flat:
        ax.set_facecolor("#0f2236")

    # 1. Types de biens
    type_counts = listings["type_bien"].value_counts()
    axes[0][0].pie(type_counts, labels=type_counts.index,
                   colors=COLORS[:len(type_counts)], autopct="%1.0f%%",
                   textprops={"color": CREAM, "fontsize": 8},
                   wedgeprops={"edgecolor": NAVY, "linewidth": 1.5})
    axes[0][0].set_title("Types de biens", color=CREAM, fontsize=11, pad=10)

    # 2. Prix moyen par type
    price_by_type = listings.groupby("type_bien")["prix"].mean().sort_values(ascending=False)
    axes[0][1].bar(range(len(price_by_type)), price_by_type.values,
                   color=GOLD, edgecolor="none", width=0.6)
    axes[0][1].set_xticks(range(len(price_by_type)))
    axes[0][1].set_xticklabels(price_by_type.index, rotation=30,
                                ha="right", color=CREAM, fontsize=8)
    axes[0][1].set_ylabel("Prix moyen (€)", color=CREAM, fontsize=9)
    axes[0][1].set_title("Prix moyen par type de bien", color=CREAM, fontsize=11, pad=10)
    axes[0][1].tick_params(colors=CREAM)
    for sp in axes[0][1].spines.values():
        sp.set_edgecolor("#1a2e45")

    # 3. Statuts
    statut_counts = listings["statut"].value_counts()
    statut_colors = ["#22c55e", "#f97316", "#ef4444", "#7c3aed", "#6b7280"]
    axes[1][0].bar(range(len(statut_counts)), statut_counts.values,
                   color=statut_colors[:len(statut_counts)], edgecolor="none", width=0.6)
    axes[1][0].set_xticks(range(len(statut_counts)))
    axes[1][0].set_xticklabels(statut_counts.index, rotation=20, ha="right",
                                color=CREAM, fontsize=8)
    axes[1][0].set_title("Répartition par statut", color=CREAM, fontsize=11, pad=10)
    axes[1][0].tick_params(colors=CREAM)
    for sp in axes[1][0].spines.values():
        sp.set_edgecolor("#1a2e45")

    # 4. Top 5 villes par volume
    top_villes = listings.groupby("ville")["id"].count().sort_values(ascending=False).head(5)
    axes[1][1].barh(top_villes.index[::-1], top_villes.values[::-1],
                    color=GOLD, edgecolor="none", height=0.5)
    axes[1][1].set_title("Top 5 villes (nb biens)", color=CREAM, fontsize=11, pad=10)
    axes[1][1].tick_params(colors=CREAM)
    for sp in axes[1][1].spines.values():
        sp.set_edgecolor("#1a2e45")

    plt.tight_layout()
    plt.savefig(f"{OUTPUT_DIR}/dashboard_recapitulatif.png", dpi=150,
                bbox_inches="tight", facecolor=NAVY)
    plt.close()
    print(f"📊 Dashboard → rapports/dashboard_recapitulatif.png")


# ─── POINT D'ENTRÉE ──────────────────────────────────────────────────────────
def main():
    print("╔══════════════════════════════════════════════════╗")
    print("║     YMMO — Analyse de données immobilières       ║")
    print(f"║     {datetime.now().strftime('%d/%m/%Y  %H:%M:%S')}                        ║")
    print("╚══════════════════════════════════════════════════╝")

    conn        = connect()
    listings, applications = load_data(conn)

    if listings.empty:
        print("⚠️  Aucun bien en base de données. Vérifiez que des données sont insérées.")
        conn.close()
        return

    rapport_statistiques(listings, applications)
    rapport_prix_villes(listings)
    rapport_biens_populaires(listings, applications)
    rapport_dpe(listings)
    rapport_agences(listings, applications)
    rapport_tendances(listings)
    rapport_dashboard(listings, applications)

    conn.close()

    print("\n" + "═"*60)
    print(f"  ✅ Analyse terminée — Rapports dans : {OUTPUT_DIR}")
    print("═"*60)


if __name__ == "__main__":
    main()
