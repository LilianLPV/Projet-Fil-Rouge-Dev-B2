package com.ymmo.controller;

import com.ymmo.repository.ApplicationRepository;
import com.ymmo.repository.ListingRepository;
import com.ymmo.repository.AgencyRepository;
import com.ymmo.repository.UserRepository;
import org.springframework.web.bind.annotation.*;

import java.util.*;

/**
 * Endpoint de statistiques avancées pour le tableau de bord et l'analyse de données.
 * Utilise des requêtes JPQL et SQL natives définies dans les repositories.
 */
@RestController
@RequestMapping("/api/stats")
@CrossOrigin(origins = "*")
public class StatsController {

    private final ListingRepository listingRepo;
    private final ApplicationRepository applicationRepo;
    private final AgencyRepository agencyRepo;
    private final UserRepository userRepo;

    public StatsController(ListingRepository listingRepo,
                           ApplicationRepository applicationRepo,
                           AgencyRepository agencyRepo,
                           UserRepository userRepo) {
        this.listingRepo = listingRepo;
        this.applicationRepo = applicationRepo;
        this.agencyRepo = agencyRepo;
        this.userRepo = userRepo;
    }

    /** KPIs globaux */
    @GetMapping("/kpis")
    public Map<String, Object> getKpis() {
        Map<String, Object> kpis = new LinkedHashMap<>();
        kpis.put("totalListings",     listingRepo.count());
        kpis.put("totalApplications", applicationRepo.count());
        kpis.put("totalAgencies",     agencyRepo.count());
        kpis.put("totalUsers",        userRepo.count());

        // Prix moyen global
        listingRepo.findAll().stream()
            .map(l -> l.getPrice())
            .filter(Objects::nonNull)
            .mapToDouble(p -> p.doubleValue())
            .average()
            .ifPresent(avg -> kpis.put("avgPrice", Math.round(avg)));

        return kpis;
    }

    /** Biens par type */
    @GetMapping("/by-type")
    public List<Map<String, Object>> getByType() {
        List<Map<String, Object>> result = new ArrayList<>();
        for (Object[] row : listingRepo.findCountByType()) {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("label", row[0]);
            m.put("count", ((Number) row[1]).longValue());
            result.add(m);
        }
        return result;
    }

    /** Biens par statut */
    @GetMapping("/by-status")
    public List<Map<String, Object>> getByStatus() {
        List<Map<String, Object>> result = new ArrayList<>();
        for (Object[] row : listingRepo.findCountByStatus()) {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("label", row[0]);
            m.put("count", ((Number) row[1]).longValue());
            result.add(m);
        }
        return result;
    }

    /** Biens par agence */
    @GetMapping("/by-agency")
    public List<Map<String, Object>> getByAgency() {
        List<Map<String, Object>> result = new ArrayList<>();
        for (Object[] row : listingRepo.findCountByAgency()) {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("agency", row[0]);
            m.put("count",  ((Number) row[1]).longValue());
            result.add(m);
        }
        return result;
    }

    /** Prix moyen par ville */
    @GetMapping("/avg-price-by-city")
    public List<Map<String, Object>> getAvgPriceByCity() {
        List<Map<String, Object>> result = new ArrayList<>();
        for (Object[] row : listingRepo.findAvgPriceByCity()) {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("city",     row[0]);
            m.put("avgPrice", row[1] != null ? Math.round(((Number) row[1]).doubleValue()) : 0);
            result.add(m);
        }
        return result;
    }

    /** Distribution DPE */
    @GetMapping("/dpe")
    public List<Map<String, Object>> getDpe() {
        List<Map<String, Object>> result = new ArrayList<>();
        for (Object[] row : listingRepo.findCountByDpe()) {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("rating", row[0]);
            m.put("count",  ((Number) row[1]).longValue());
            result.add(m);
        }
        return result;
    }

    /** Biens publiés par mois */
    @GetMapping("/listings-by-month")
    public List<Map<String, Object>> getListingsByMonth() {
        List<Map<String, Object>> result = new ArrayList<>();
        for (Object[] row : listingRepo.findListingsByMonth()) {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("month", row[0]);
            m.put("count", ((Number) row[1]).longValue());
            result.add(m);
        }
        return result;
    }

    /** Top biens les plus demandés */
    @GetMapping("/top-listings")
    public List<Map<String, Object>> getTopListings() {
        List<Map<String, Object>> result = new ArrayList<>();
        int i = 0;
        for (Object[] row : listingRepo.findMostRequestedListings()) {
            if (i++ >= 10) break;
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("title",       row[0]);
            m.put("city",        row[1]);
            m.put("price",       row[2]);
            m.put("nbDemandes",  ((Number) row[3]).longValue());
            result.add(m);
        }
        return result;
    }

    /** Statistiques prix par type (min, moy, max) */
    @GetMapping("/price-stats")
    public List<Map<String, Object>> getPriceStats() {
        List<Map<String, Object>> result = new ArrayList<>();
        for (Object[] row : listingRepo.findPriceStatsByType()) {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("type", row[0]);
            m.put("avg",  row[1] != null ? Math.round(((Number) row[1]).doubleValue()) : 0);
            m.put("min",  row[2] != null ? Math.round(((Number) row[2]).doubleValue()) : 0);
            m.put("max",  row[3] != null ? Math.round(((Number) row[3]).doubleValue()) : 0);
            result.add(m);
        }
        return result;
    }
}
