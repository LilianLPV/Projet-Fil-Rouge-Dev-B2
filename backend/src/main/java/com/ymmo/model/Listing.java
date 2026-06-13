package com.ymmo.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "listings")
@Data
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Listing {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_listing")
    private Integer id;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal price;

    @Column(name = "room_count")
    private Integer roomCount;

    @Column(name = "energy_rating", columnDefinition = "bpchar")
    private String energyRating;

    @Column(name = "publication_date", nullable = false)
    private LocalDate publicationDate = LocalDate.now();

    @Column(name = "land_area", precision = 10, scale = 2)
    private BigDecimal landArea;

    @Column(name = "bedroom_count")
    private Integer bedroomCount;

    @Column(name = "living_area", precision = 10, scale = 2)
    private BigDecimal livingArea;

    @Column(name = "floor_number")
    private Integer floorNumber;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "fk_address", nullable = false)
    private ListingAddress address;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "fk_type", nullable = false)
    private ListingType type;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "fk_picture")
    private ListingPicture mainPicture;

    @OneToMany(mappedBy = "listing", fetch = FetchType.EAGER)
    private List<ListingPicture> pictures = new ArrayList<>();

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "fk_status", nullable = false)
    private ListingStatus status;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "fk_agency", nullable = false)
    private Agency agency;

    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(
        name = "features_listings",
        joinColumns = @JoinColumn(name = "fk_listing"),
        inverseJoinColumns = @JoinColumn(name = "fk_feature")
    )
    private List<Feature> features = new ArrayList<>();
}
