package com.ymmo.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;

@Entity
@Table(name = "applications")
@Data
public class Application {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_application")
    private Integer id;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String message;

    @Column(name = "submission_date", nullable = false)
    private LocalDate submissionDate;

    @PrePersist
    public void prePersist() {
        if (submissionDate == null) {
            submissionDate = LocalDate.now();
        }
    }

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "fk_status", nullable = false)
    private ApplicationStatus status;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "fk_user", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "fk_listing", nullable = false)
    private Listing listing;
}
