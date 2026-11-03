package com.InvesteAI.backend.service;

import org.springframework.stereotype.Service;

import com.InvesteAI.backend.model.User;
import com.InvesteAI.backend.repository.UserRepository;

@Service 
public class UserService {
    private final UserRepository ur;

    public UserService(UserRepository ur){
        this.ur = ur;
    }

    public User buscarUsuario(Long id){
        User usuario = ur.buscarUsuario(id);
        return usuario;
    }

    public void deletarUsuario(Long id){
        ur.deletarUsuario(id);
    }

    public void criarUsuario(User user){
        ur.criarUsuario(user);
    }

    public void atualizarUsuario(User user){
        ur.atualizarUsuario(user);
    }

    public void imprimirUser(User u){
        System.err.println(u.getNome());
        System.err.println(u.getEmail());
        System.err.println(u.getId());
    }
}
