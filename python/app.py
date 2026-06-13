"""
YMMO — Serveur Flask d'analyse de données
==========================================
Récupère les données via l'API Spring Boot (port 8080)
puis génère des graphiques matplotlib + un résumé JSON.

Avantage : aucune connexion directe à PostgreSQL,
           pas de problème d'encodage Windows.

Démarrage :
  python app.py

Prérequis : Spring Boot doit tourner sur localhost:8080
"""

import os
import sys
import threading
import traceback
from datetime import datetime
from pathlib import Path

import requests
from flask import Flask, jsonify, send_file, abort
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

OUTPUT_DIR  = Path(__file__).parent / "rapports"
OUTPUT_DIR.mkdir(exist_ok=True)

SPRING_BASE = os.getenv("SPRING_URL", "http://localhost:8080/api")

# ── État global ───────────────────────────────────────────────────────────────
state = {
    "status":     "pending",
    "started_at": None,
    "done_at":    None,
    "error":      None,
    "summary":    None,
}

# ── Helpers ───────────────────────────────────────────────────────────────────
def api(path):
    """Appel GET vers l'API Spring Boot, retourne le JSON ou []."""
    try:
        r = requests.get(f"{SPRING_BASE}{path}", timeout=10)
        r.raise_for_status()
        return r.json()
    except Exception as e:
        print(f"  ⚠️  {path} → {e}")
        return []

# ── Analyse principale ────────────────────────────────────────────────────────
def run_analysis():
    state["status"]     = "running"
    state["started_at"] = datetime.now().isoformat()
    state["error"]      = None

    try:
        import numpy as np
        import matplotlib
        matplotlib.use('Agg')
        import matplotlib.pyplot as plt

        # ── 1. Récupération des données via l'API ──────────────────────────────
        print("  📡 Appel de l'API Spring Boot…")

        kpis      = api("/stats/kpis")
        print(f"    kpis type: {type(kpis).__name__} — {str(kpis)[:80]}")
        by_type   = api("/stats/by-type")
        by_status = api("/stats/by-status")
        by_agency = api("/stats/by-agency")
        avg_city  = api("/stats/avg-price-by-city")
        dpe_raw   = api("/stats/dpe")
        by_month  = api("/stats/listings-by-month")
        top_list  = api("/stats/top-listings")
        price_st  = api("/stats/price-stats")

        # ── 2. Construction du résumé JSON ─────────────────────────────────────
        # Sécuriser : si c'est une liste, prendre le premier élément
        if isinstance(kpis, list): kpis = kpis[0] if kpis else {}
        if isinstance(by_type, dict): by_type = [by_type]
        if isinstance(by_status, dict): by_status = [by_status]
        if isinstance(by_agency, dict): by_agency = [by_agency]
        if isinstance(avg_city, dict): avg_city = [avg_city]
        if isinstance(dpe_raw, dict): dpe_raw = [dpe_raw]
        if isinstance(by_month, dict): by_month = [by_month]

        summary = {
            "kpis": {
                "total_listings":     kpis.get("totalListings", 0) if isinstance(kpis, dict) else 0,
                "total_applications": kpis.get("totalApplications", 0) if isinstance(kpis, dict) else 0,
                "total_agencies":     kpis.get("totalAgencies", 0) if isinstance(kpis, dict) else 0,
                "avg_price":          kpis.get("avgPrice", 0) if isinstance(kpis, dict) else 0,
            },
            "by_type":   {r["label"]: r["count"] for r in (by_type or [])   if isinstance(r, dict)},
            "by_status": {r["label"]: r["count"] for r in (by_status or []) if isinstance(r, dict)},
            "by_agency": {r["agency"]: r["count"] for r in (by_agency or []) if isinstance(r, dict)},
            "avg_price_by_city": {
                r["city"]: r["avgPrice"]
                for r in (avg_city or []) if isinstance(r, dict) and r.get("city")
            },
            "dpe": {r["rating"]: r["count"] for r in (dpe_raw or []) if isinstance(r, dict)},
            "top_listings": top_list if isinstance(top_list, list) else [],
            "price_stats":  price_st  if isinstance(price_st, list)  else [],
        }

        # Tendance à partir des publications mensuelles
        months = [r for r in (by_month or []) if isinstance(r, dict)]
        if len(months) >= 2:
            counts = [r.get("count", 0) for r in months]
            x = list(range(len(counts)))
            coeffs = np.polyfit(x, counts, 1)
            summary["trend"] = {
                "direction":     "hausse" if coeffs[0] > 0 else "baisse",
                "monthly_change": abs(int(coeffs[0])),
                "nb_months":     len(months),
            }
        else:
            summary["trend"] = {"direction": "insuffisant", "monthly_change": 0, "nb_months": len(months)}

        state["summary"] = summary

        # ── 3. Génération des graphiques ───────────────────────────────────────
        NAVY   = "#0d1b2a"
        GOLD   = "#c9a96e"
        CREAM  = "#f5f2eb"
        COLORS = ['#c9a96e','#3d5a80','#e07b4a','#6b4f8a','#2e7d5a','#e5a02a','#8b4513','#4a90d9']
        DPE_C  = {"A":"#22c55e","B":"#84cc16","C":"#eab308","D":"#f97316","E":"#ef4444","F":"#dc2626","G":"#7f1d1d"}

        def base_fig(w=11, h=5):
            fig, ax = plt.subplots(figsize=(w, h))
            fig.patch.set_facecolor(NAVY)
            ax.set_facecolor("#0f2236")
            for sp in ax.spines.values(): sp.set_edgecolor("#1a2e45")
            ax.tick_params(colors=CREAM)
            return fig, ax

        def save(name):
            plt.tight_layout()
            plt.savefig(OUTPUT_DIR / name, dpi=130, bbox_inches="tight", facecolor=NAVY)
            plt.close()
            print(f"  📊 {name}")

        # Graphique 1 — Prix moyen par ville
        city_data = list(summary["avg_price_by_city"].items())[:10]
        if city_data:
            villes, prix = zip(*city_data)
            fig, ax = base_fig(11, 5)
            bars = ax.barh(list(villes)[::-1], list(prix)[::-1], color=GOLD, edgecolor="none", height=0.6)
            ax.set_title("Prix moyen par ville — Top 10", color=CREAM, fontsize=13, fontweight="bold", pad=12)
            ax.set_xlabel("Prix (€)", color=CREAM)
            mx = max(prix)
            for bar, val in zip(bars, list(prix)[::-1]):
                ax.text(bar.get_width() + mx*0.01, bar.get_y() + bar.get_height()/2,
                        f"{int(val):,} €", va="center", color=CREAM, fontsize=8)
            save("prix_par_ville.png")

        # Graphique 2 — Types de biens (camembert)
        if summary["by_type"]:
            labels = list(summary["by_type"].keys())
            vals   = list(summary["by_type"].values())
            fig, ax = plt.subplots(figsize=(8, 6))
            fig.patch.set_facecolor(NAVY); ax.set_facecolor(NAVY)
            wedges, texts, autotexts = ax.pie(
                vals, labels=labels, colors=COLORS[:len(vals)],
                autopct="%1.1f%%", startangle=90,
                textprops={"color": CREAM, "fontsize": 9},
                wedgeprops={"edgecolor": NAVY, "linewidth": 2}
            )
            for at in autotexts: at.set_color(NAVY); at.set_fontweight("bold")
            ax.set_title("Répartition par type de bien", color=CREAM, fontsize=13, fontweight="bold", pad=12)
            save("types_biens.png")

        # Graphique 3 — DPE
        dpe_items = sorted(summary["dpe"].items())
        if dpe_items:
            dk, dv = zip(*dpe_items)
            fig, ax = base_fig(8, 5)
            bars = ax.bar(dk, dv, color=[DPE_C.get(k, GOLD) for k in dk], edgecolor="none", width=0.6)
            for bar, val in zip(bars, dv):
                ax.text(bar.get_x() + bar.get_width()/2, bar.get_height() + 0.05,
                        str(int(val)), ha="center", color=CREAM, fontsize=10, fontweight="bold")
            ax.set_title("Distribution des classes DPE", color=CREAM, fontsize=13, fontweight="bold", pad=12)
            ax.set_xlabel("Classe DPE", color=CREAM); ax.set_ylabel("Nb biens", color=CREAM)
            save("distribution_dpe.png")

        # Graphique 4 — Biens par agence
        ag_items = list(summary["by_agency"].items())[:8]
        if ag_items:
            an, av = zip(*ag_items)
            fig, ax = base_fig(10, 5)
            ax.bar(range(len(an)), av, color=GOLD, edgecolor="none", width=0.6)
            ax.set_xticks(range(len(an)))
            ax.set_xticklabels(an, rotation=30, ha="right", color=CREAM, fontsize=9)
            ax.set_title("Biens par agence", color=CREAM, fontsize=13, fontweight="bold", pad=12)
            ax.set_ylabel("Nb biens", color=CREAM)
            save("biens_par_agence.png")

        # Graphique 5 — Publications par mois (line chart)
        if len(months) >= 2:
            labels_m = [r.get("month", r.get("mois", str(i)))[-5:] for i, r in enumerate(months)]
            counts_m = [r.get("count", 0) for r in months]
            fig, ax = base_fig(12, 5)
            ax.plot(range(len(counts_m)), counts_m, "o-", color=GOLD, linewidth=2.5, markersize=5, label="Publications")
            coeffs2 = np.polyfit(range(len(counts_m)), counts_m, 1)
            x_fit = np.linspace(0, len(counts_m)-1, 100)
            ax.plot(x_fit, np.polyval(coeffs2, x_fit), "--", color="#e07b4a", linewidth=1.5, alpha=0.8, label="Tendance")
            ax.set_xticks(range(len(counts_m)))
            ax.set_xticklabels(labels_m, rotation=45, ha="right", color=CREAM, fontsize=8)
            ax.set_title("Publications par mois (12 derniers mois)", color=CREAM, fontsize=13, fontweight="bold", pad=12)
            ax.set_ylabel("Nb biens publiés", color=CREAM)
            ax.legend(facecolor=NAVY, edgecolor="#1a2e45", labelcolor=CREAM)
            save("tendance_prix.png")

        # Graphique 6 — Dashboard récap 4-en-1
        fig, axes = plt.subplots(2, 2, figsize=(14, 9))
        fig.patch.set_facecolor(NAVY)
        fig.suptitle("YMMO — Analyse de données Python", color=CREAM, fontsize=15, fontweight="bold")
        for ax in axes.flat:
            ax.set_facecolor("#0f2236")
            for sp in ax.spines.values(): sp.set_edgecolor("#1a2e45")
            ax.tick_params(colors=CREAM)

        # [0,0] camembert types
        if summary["by_type"]:
            tl = list(summary["by_type"].keys()); tv = list(summary["by_type"].values())
            axes[0][0].pie(tv, labels=tl, colors=COLORS[:len(tl)], autopct="%1.0f%%",
                           textprops={"color":CREAM,"fontsize":8}, wedgeprops={"edgecolor":NAVY,"linewidth":1.5})
            axes[0][0].set_title("Types de biens", color=CREAM, fontsize=11)

        # [0,1] prix par ville
        if city_data:
            cv = list(city_data)[:5]; cn, cp = zip(*cv)
            axes[0][1].barh(list(cn)[::-1], list(cp)[::-1], color=GOLD, edgecolor="none", height=0.5)
            axes[0][1].set_title("Prix moyen / ville", color=CREAM, fontsize=11)
            axes[0][1].tick_params(colors=CREAM)

        # [1,0] statuts
        if summary["by_status"]:
            sl = list(summary["by_status"].keys()); sv = list(summary["by_status"].values())
            clrs = ["#22c55e","#f97316","#ef4444","#7c3aed","#6b7280"]
            axes[1][0].bar(range(len(sl)), sv, color=clrs[:len(sl)], edgecolor="none", width=0.6)
            axes[1][0].set_xticks(range(len(sl)))
            axes[1][0].set_xticklabels(sl, rotation=20, ha="right", color=CREAM, fontsize=8)
            axes[1][0].set_title("Statuts", color=CREAM, fontsize=11)
            axes[1][0].tick_params(colors=CREAM)

        # [1,1] DPE
        if dpe_items:
            axes[1][1].bar(dk, dv, color=[DPE_C.get(k, GOLD) for k in dk], edgecolor="none", width=0.6)
            axes[1][1].set_title("DPE", color=CREAM, fontsize=11)
            axes[1][1].tick_params(colors=CREAM)

        plt.tight_layout()
        plt.savefig(OUTPUT_DIR / "dashboard_recap.png", dpi=130, bbox_inches="tight", facecolor=NAVY)
        plt.close()
        print("  📊 dashboard_recap.png")

        state["status"]  = "done"
        state["done_at"] = datetime.now().isoformat()
        total = state["summary"]["kpis"]["total_listings"]
        print(f"✅ Analyse terminée — {total} biens analysés")

    except Exception as e:
        state["status"] = "error"
        state["error"]  = str(e)
        traceback.print_exc()
        print(f"❌ Erreur : {e}")


# ── Routes Flask ──────────────────────────────────────────────────────────────

@app.route("/status")
def get_status():
    return jsonify({
        "status":     state["status"],
        "started_at": state["started_at"],
        "done_at":    state["done_at"],
        "error":      state["error"],
    })

@app.route("/summary")
def get_summary():
    if state["status"] != "done":
        return jsonify({"error": "Analyse pas encore terminée", "status": state["status"]}), 202
    return jsonify(state["summary"])

@app.route("/images/<name>")
def get_image(name):
    path = OUTPUT_DIR / name
    if not path.exists() or path.suffix != ".png":
        abort(404)
    return send_file(str(path), mimetype="image/png")

@app.route("/images")
def list_images():
    return jsonify([f.name for f in OUTPUT_DIR.glob("*.png")])

@app.route("/refresh", methods=["POST"])
def refresh():
    if state["status"] == "running":
        return jsonify({"message": "Analyse déjà en cours"}), 409
    threading.Thread(target=run_analysis, daemon=True).start()
    return jsonify({"message": "Analyse relancée"})


# ── Démarrage ─────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    print("🚀 YMMO Analytics Server — port 5001")
    print(f"   API Spring Boot : {SPRING_BASE}")
    print("   Démarrage de l'analyse en arrière-plan…")
    threading.Thread(target=run_analysis, daemon=True).start()
    app.run(port=5001, debug=False)
