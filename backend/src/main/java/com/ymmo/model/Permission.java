package com.ymmo.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "permissions")
@Data
public class Permission {

    @Id
    @Column(name = "tag_permission", length = 100)
    private String tagPermission;
}
