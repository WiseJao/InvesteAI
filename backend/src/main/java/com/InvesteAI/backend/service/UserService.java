package com.InvesteAI.backend.service;

import com.InvesteAI.backend.interfaces.UserInterface;
import org.springframework.stereotype.Service;

import com.InvesteAI.backend.model.User;

import java.util.UUID;

@Service 
public class UserService {
    private final UserInterface ur;

    public UserService(UserInterface ur){
        this.ur = ur;
    }


    public User buscarUsuario(UUID id) {
        return ur.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

}
