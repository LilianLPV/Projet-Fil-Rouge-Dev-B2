package com.ymmo.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "agencies")
@Data
public class Agency {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_agency")
    private Integer id;

    @Column(name = "name", nullable = false)
    private String nom;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "phone_number")
    private String telephone;

    // Clés étrangères
    @Column(name = "fk_address")
    private Integer adresseId;

    @Column(name = "fk_picture")
    private Integer photoId;
}