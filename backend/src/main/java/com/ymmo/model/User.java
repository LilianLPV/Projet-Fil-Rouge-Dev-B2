package com.ymmo.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "users")
@Data
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_user")
    private Integer id;

    @Column(nullable = false, unique = true, length = 100)
    private String username;

    @JsonIgnore
    @Column(nullable = false, length = 255)
    private String password;

    @Column(nullable = false, unique = true, length = 150)
    private String email;

    @Column(name = "profile_picture", columnDefinition = "TEXT")
    private String profilePicture;

    @Column(name = "profile_description", columnDefinition = "TEXT")
    private String profileDescription;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "fk_agency")
    private Agency agency;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "fk_role", nullable = false)
    private Role role;
}
