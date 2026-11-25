package com.InvesteAI.backend.Controller;

import com.InvesteAI.backend.dto.auth.response.UserResponse;
import com.InvesteAI.backend.model.ProfileImage;
import com.InvesteAI.backend.security.CurrentUser;
import com.InvesteAI.backend.service.ProfileImageService;
import org.springframework.http.CacheControl;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import com.InvesteAI.backend.model.User;
import com.InvesteAI.backend.service.UserService;

import java.util.UUID;
import java.io.IOException;

/**
 * REST controller for authenticated user account and profile management.
 * <p>
 * Provides endpoints to retrieve the authenticated user's profile and manage their avatar.
 * </p>
 */
@RestController 
@RequestMapping("/user")
public class UserController {

    private final UserService userservice;
    private final ProfileImageService profileImages;

    public UserController(UserService userservice, ProfileImageService profileImages){
        this.userservice = userservice;
        this.profileImages = profileImages;
    }

    /**
     * Replaces the authenticated user's avatar via {@code POST /user/me/avatar}.
     *
     * @param userID authenticated user identifier
     * @param file multipart {@code file} part containing a JPEG or PNG, up to 2 MiB
     * @return HTTP 204 on success; invalid size yields 400, invalid format 415,
     *         and a missing profile 404
     * @throws IOException if the uploaded file cannot be read
     */
    @PostMapping(value = "/me/avatar", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Void> uploadAvatar(@CurrentUser UUID userID, @RequestPart("file") MultipartFile file) throws IOException {
        profileImages.upload(userID, file);
        return ResponseEntity.noContent().build();
    }

    /**
     * Retrieves the authenticated user's avatar via {@code GET /user/me/avatar}.
     *
     * @param userID authenticated user identifier
     * @return HTTP 200 with image bytes and their media type, or 404 if absent
     */
    @GetMapping("/me/avatar")
    public ResponseEntity<byte[]> getAvatar(@CurrentUser UUID userID) {
        ProfileImage image = profileImages.get(userID);
        return ResponseEntity.ok().cacheControl(CacheControl.noStore())
                .header("X-Content-Type-Options", "nosniff")
                .contentType(MediaType.parseMediaType(image.getContentType())).body(image.getImageData());
    }

    @DeleteMapping("/me/avatar")
    public ResponseEntity<Void> deleteAvatar(@CurrentUser UUID userID) {
        profileImages.delete(userID);
        return ResponseEntity.noContent().build();
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

}
