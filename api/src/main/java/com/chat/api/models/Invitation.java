package com.chat.api.models;

import jakarta.persistence.*;
import lombok.Data;

import java.util.Date;

@Entity
@Data
public class Invitation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String code;

    @Column(nullable = false)
    private boolean used = false;

    @Column(nullable = false)
    private Date expirationDate;

    // Constructor sin parámetros (necesario para Hibernate)
    public Invitation() {
    }

    // Constructor con parámetros
    public Invitation(String code, Date expirationDate) {
        this.code = code;
        this.expirationDate = expirationDate;
        this.used = false; // Si quieres marcar las invitaciones como no usadas por defecto
    }
}

