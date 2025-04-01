package com.chat.api.controllers;

import com.chat.api.models.Invitation;
import com.chat.api.services.InvitationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/invitations")
public class InvitationController {

    @Autowired
    private InvitationService invitationService;

    // Endpoint para generar una nueva invitación
    @PostMapping("/generate")
    public ResponseEntity<Invitation> generateInvitation() {
        Invitation invitation = invitationService.generateInvitation();
        return ResponseEntity.ok(invitation); // Retorna la invitación generada
    }

    // Endpoint para obtener todas las invitaciones no usadas
    @GetMapping("/unused")
    public ResponseEntity<List<Invitation>> getUnusedInvitations() {
        List<Invitation> invitations = invitationService.getUnusedInvitations();
        return ResponseEntity.ok(invitations); // Retorna las invitaciones no usadas
    }
}

