package com.ymmo.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
@Table(name = "permissions")
@Data
public class Permission {

    @Id
    @Column(name = "tag_permission", length = 100)
    private String tagPermission;
}


