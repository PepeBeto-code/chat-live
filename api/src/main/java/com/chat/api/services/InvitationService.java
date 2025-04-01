package com.chat.api.services;
import com.chat.api.models.Invitation;
import com.chat.api.repositories.InvitationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.Date;
import java.util.List;
import java.util.UUID;

@Service
public class InvitationService {

    @Autowired
    private InvitationRepository invitationRepository;

    // Método para generar un código de invitación único
    public Invitation generateInvitation() {
        String code = generateUniqueCode();
        Date expirationDate = new Date(System.currentTimeMillis() + 24 * 60 * 60 * 1000); // Expira en 24 horas
        Invitation invitation = new Invitation(code, expirationDate);

        // Guardamos la invitación en la base de datos
        return invitationRepository.save(invitation);
    }

    // Genera un código único aleatorio
    private String generateUniqueCode() {
        return UUID.randomUUID().toString(); // Genera un UUID como código único
    }

    // Método para obtener las invitaciones no usadas
    public List<Invitation> getUnusedInvitations() {
        return invitationRepository.findByUsedFalse();
    }
}

