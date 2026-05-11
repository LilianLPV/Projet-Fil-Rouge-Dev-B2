package com.ymmo.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "agencies_pictures")
@Data
public class AgencyPicture {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_picture")
    private Integer id;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String picture;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "fk_agency", nullable = false)
    @JsonIgnore
    private Agency agency;
}
