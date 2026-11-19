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

    public Iterable<User> buscarTodosUsuarios(){
        return ur.findAll();
    }
    public User buscarUsuario(UUID id) {
        return ur.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    public void deletarUsuario(UUID id){
        ur.deleteById(id);
    }

    public void criarUsuario(User user){
        ur.save(user);
    }

    public void atualizarUsuario(User user){
        ur.save(user);
    }

    public void imprimirUser(User u){
        System.out.println(u.getName());
        System.out.println(u.getEmail());
        System.out.println(u.getId());
    }
}
