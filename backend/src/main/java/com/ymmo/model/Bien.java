package com.ymmo.model;

import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "listings")
@Data
public class Bien {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_listing")
    private Integer id;

    @Column(name = "title", nullable = false)
    private String titre;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "price", nullable = false)
    private BigDecimal prix;

    @Column(name = "room_count")
    private Integer nbPieces;

    @Column(name = "bedroom_count")
    private Integer nbChambres;

    @Column(name = "living_area")
    private BigDecimal surfaceHabitable;

    @Column(name = "land_area")
    private BigDecimal surfaceTerrain;

    @Column(name = "floor_number")
    private Integer etage;

    @Column(name = "energy_rating", columnDefinition = "bpchar")
    private String dpe;

    @Column(name = "publication_date")
    private LocalDate datePublication;

    @Column(name = "fk_address")
    private Integer adresseId;

    @Column(name = "fk_type")
    private Integer typeId;

    @Column(name = "fk_status")
    private Integer statutId;

    @Column(name = "fk_agency")
    private Integer agenceId;

    @Column(name = "fk_picture")
    private Integer photoId;
}