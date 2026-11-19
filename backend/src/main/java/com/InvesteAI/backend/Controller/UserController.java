package com.InvesteAI.backend.Controller;

import com.InvesteAI.backend.dto.auth.response.UserResponse;
import com.InvesteAI.backend.security.CurrentUser;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.InvesteAI.backend.model.User;
import com.InvesteAI.backend.service.UserService;

import java.util.UUID;

/**
 * REST controller for authenticated user account and profile management.
 * <p>
 * Provides endpoints to retrieve and update personal profile attributes,
 * as well as administrative lookup and removal operations.
 * </p>
 */
@RestController 
@RequestMapping("/user")
public class UserController {

    private final UserService userservice;

    public UserController(UserService userservice){
        this.userservice = userservice;
    }

    /**
     * Retrieves the profile, account details, and financial parameters for the authenticated user.
     *
     * @param userID the authenticated user ID injected from the JWT token
     * @return {@link ResponseEntity} containing the user's account and profile data
     */
    @GetMapping("/me")
    public ResponseEntity<UserResponse> getMe(@CurrentUser UUID userID) {
        User user = userservice.buscarUsuario(userID);
        return ResponseEntity.ok(UserResponse.from(user));
    }

    /**
     * Updates personal and financial profile parameters for the authenticated user.
     *
     * @param userID the authenticated user ID injected from the JWT token
     * @param user   the user object containing fields to update (email, profile attributes)
     * @return {@link ResponseEntity} containing the updated user account and profile
     */
    @PatchMapping
    public ResponseEntity<UserResponse> patchMe(@CurrentUser UUID userID, @RequestBody User user) {
        User updatedUser = userservice.atualizarUsuario(userID, user);
        return ResponseEntity.ok(UserResponse.from(updatedUser));
    }

    /**
     * Internal endpoint to search a specific user by their unique identifier.
     *
     * @param id the unique UUID of the user
     * @return the {@link User} entity if found
     */
    @GetMapping("/{id}")
    public User buscarUsuario(@PathVariable UUID id){
        return userservice.buscarUsuario(id);
    }

    /**
     * Internal administrative endpoint to list all registered users.
     *
     * @return iterable collection of all {@link User} entities
     */
    @GetMapping("/all")
    public Iterable<User> buscarTodosUsuarios(){
        return userservice.buscarTodosUsuarios();
    }

    /**
     * Administrative endpoint to delete a user account by unique identifier.
     *
     * @param id the unique UUID of the user to remove
     */
    @DeleteMapping 
    public void deletarUsuario(@RequestBody UUID id){
        userservice.deletarUsuario(id);
    }
}
