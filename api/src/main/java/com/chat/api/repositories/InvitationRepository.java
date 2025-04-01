package com.chat.api.repositories;

import com.chat.api.models.Invitation;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface InvitationRepository extends JpaRepository<Invitation, Long> {

    // Método para encontrar una invitación por su código
    Optional<Invitation> findByCode(String code);

    // Método para encontrar invitaciones no usadas
    List<Invitation> findByUsedFalse();
}

