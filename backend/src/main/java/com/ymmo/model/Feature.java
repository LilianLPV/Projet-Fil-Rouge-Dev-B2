package com.ymmo.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "features")
@Data
public class Feature {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_feature")
    private Integer id;

    @Column(name = "feature_icon", length = 100)
    private String featureIcon;

    @Column(name = "feature_name", nullable = false, length = 100)
    private String featureName;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "id_feature_type", nullable = false)
    private FeatureType featureType;
}
