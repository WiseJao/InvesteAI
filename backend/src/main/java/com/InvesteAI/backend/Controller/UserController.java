package com.InvesteAI.backend.Controller;

import com.InvesteAI.backend.dto.auth.response.UserResponse;
import com.InvesteAI.backend.security.CurrentUser;
import org.springframework.security.core.Authentication;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import com.InvesteAI.backend.model.User;
import com.InvesteAI.backend.service.UserService;

import java.net.Authenticator;
import java.util.UUID;

@RestController 
@RequestMapping("/user")
public class UserController {

    private final UserService userservice;

    public UserController(UserService userservice){
        this.userservice = userservice;
    }

    @GetMapping("/me")
    public ResponseEntity<UserResponse> getMe(@CurrentUser UUID userID) {

        User user = userservice.buscarUsuario(userID);

        return ResponseEntity.ok(UserResponse.from(user));
    }

    @PatchMapping
    public ResponseEntity<UserResponse> patchMe(@CurrentUser UUID userID, @RequestBody User user) {

        User updatedUser = userservice.atualizarUsuario(userID, user);

        return ResponseEntity.ok(UserResponse.from(updatedUser));
    }





    @GetMapping("/{id}")
    public User buscarUsuario(@PathVariable UUID id){
        return userservice.buscarUsuario(id);
    }

    @GetMapping("/all")
    public Iterable<User> buscarTodosUsuarios(){
        return userservice.buscarTodosUsuarios();
    }

    @DeleteMapping 
    public void deletarUsuario(@RequestBody UUID id){
        userservice.deletarUsuario(id);
    }
}
