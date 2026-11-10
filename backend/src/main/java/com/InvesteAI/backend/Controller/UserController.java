package com.InvesteAI.backend.Controller;

import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.InvesteAI.backend.model.User;
import com.InvesteAI.backend.service.UserService;

@RestController 
@RequestMapping("/users")
public class UserController {

    private final UserService userservice;

    public UserController(UserService userservice){
        this.userservice = userservice;
    }

    @GetMapping("/{id}")
    public User buscarUsuario(@PathVariable Long id){
        return userservice.buscarUsuario(id);
    }
    
    @PostMapping
    public void inserirUsuario(@RequestBody User user){
        userservice.criarUsuario(user);
    }

    @PutMapping("/{id}")
    public void atualizarUsuario(@RequestBody User user, @PathVariable Long id){
        user.setId(id);
        userservice.atualizarUsuario(user);
    }

    @DeleteMapping 
    public void deletarUsuario(@RequestBody Long id){
        userservice.deletarUsuario(id);
    }
}
