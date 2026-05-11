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

    @Column(nullable = false, length = 150)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "phone_number", length = 20)
    private String phoneNumber;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "fk_address", nullable = false)
    private AgencyAddress address;
}
