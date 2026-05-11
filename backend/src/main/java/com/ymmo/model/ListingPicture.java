package com.ymmo.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "listing_pictures")
@Data
public class ListingPicture {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_picture")
    private Integer id;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String picture;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "fk_listing")
    @JsonIgnore
    private Listing listing;
}
