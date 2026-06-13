package com.ymmo.repository;

import com.ymmo.model.Agency;
import com.ymmo.model.Listing;
import com.ymmo.model.ListingStatus;
import com.ymmo.model.ListingType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.util.List;

public interface ListingRepository extends JpaRepository<Listing, Integer> {

    // ── Filtres de base ──────────────────────────────────────────────────────
    List<Listing> findByAgency(Agency agency);
    List<Listing> findByType(ListingType type);
    List<Listing> findByStatus(ListingStatus status);
    List<Listing> findByAddressCity(String city);
    List<Listing> findByPriceLessThanEqual(BigDecimal maxPrice);

    // ── Requêtes SQL avancées ─────────────────────────────────────────────────

    /** Prix moyen par ville */
    @Query("SELECT l.address.city, AVG(l.price) FROM Listing l " +
           "WHERE l.address.city IS NOT NULL " +
           "GROUP BY l.address.city ORDER BY AVG(l.price) DESC")
    List<Object[]> findAvgPriceByCity();

    /** Nombre de biens par type */
    @Query("SELECT l.type.label, COUNT(l) FROM Listing l " +
           "GROUP BY l.type.label ORDER BY COUNT(l) DESC")
    List<Object[]> findCountByType();

    /** Nombre de biens par statut */
    @Query("SELECT l.status.label, COUNT(l) FROM Listing l " +
           "GROUP BY l.status.label")
    List<Object[]> findCountByStatus();

    /** Nombre de biens par agence */
    @Query("SELECT l.agency.name, COUNT(l) FROM Listing l " +
           "GROUP BY l.agency.name ORDER BY COUNT(l) DESC")
    List<Object[]> findCountByAgency();

    /** Distribution DPE */
    @Query("SELECT l.energyRating, COUNT(l) FROM Listing l " +
           "WHERE l.energyRating IS NOT NULL " +
           "GROUP BY l.energyRating ORDER BY l.energyRating")
    List<Object[]> findCountByDpe();

    /** Prix moyen par type */
    @Query("SELECT l.type.label, AVG(l.price), MIN(l.price), MAX(l.price) FROM Listing l " +
           "GROUP BY l.type.label")
    List<Object[]> findPriceStatsByType();

    /** Les biens les plus demandés (par nb de demandes) */
    @Query("SELECT l.title, l.address.city, l.price, COUNT(a) as nbDemandes " +
           "FROM Application a JOIN a.listing l " +
           "GROUP BY l.id, l.title, l.address.city, l.price " +
           "ORDER BY COUNT(a) DESC")
    List<Object[]> findMostRequestedListings();

    /** Biens publiés par mois sur les 12 derniers mois */
    @Query(value = "SELECT TO_CHAR(publication_date, 'YYYY-MM') as mois, COUNT(*) " +
                   "FROM listings " +
                   "WHERE publication_date >= NOW() - INTERVAL '12 months' " +
                   "GROUP BY mois ORDER BY mois",
           nativeQuery = true)
    List<Object[]> findListingsByMonth();

    /** Prix médian par ville (SQL natif) */
    @Query(value = "SELECT a.city, PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY l.price) as median_price " +
                   "FROM listings l JOIN listing_addresses a ON l.fk_address = a.id_address " +
                   "WHERE a.city IS NOT NULL " +
                   "GROUP BY a.city ORDER BY median_price DESC LIMIT 10",
           nativeQuery = true)
    List<Object[]> findMedianPriceByCity();
}
