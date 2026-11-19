package com.InvesteAI.backend.service;

import com.InvesteAI.backend.interfaces.ProfileImageInterface;
import com.InvesteAI.backend.interfaces.UserInterface;
import com.InvesteAI.backend.model.Profile;
import com.InvesteAI.backend.model.ProfileImage;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.util.Arrays;
import java.util.UUID;

/** Stores and retrieves the authenticated user's profile image. */
@Service
public class ProfileImageService {
    private static final long MAX_BYTES = 2 * 1024 * 1024;
    private final UserInterface users;
    private final ProfileImageInterface images;

    public ProfileImageService(UserInterface users, ProfileImageInterface images) {
        this.users = users;
        this.images = images;
    }

    /** Replaces the user's image with a nonempty JPEG or PNG of at most 2 MiB. */
    @Transactional
    public void upload(UUID userId, MultipartFile file) throws IOException {
        if (file.isEmpty() || file.getSize() > MAX_BYTES) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Image must be between 1 byte and 2 MiB");
        }
        byte[] data = file.getBytes();
        byte[] png = {(byte) 0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a};
        boolean isPng = data.length >= png.length && Arrays.equals(png, Arrays.copyOf(data, png.length));
        boolean isJpeg = data.length >= 3 && (data[0] & 0xff) == 0xff && (data[1] & 0xff) == 0xd8 && (data[2] & 0xff) == 0xff;
        String type = isPng ? "image/png" : isJpeg ? "image/jpeg" : null;
        if (type == null || !type.equalsIgnoreCase(file.getContentType())) {
            throw new ResponseStatusException(HttpStatus.UNSUPPORTED_MEDIA_TYPE, "Only JPEG and PNG images are supported");
        }
        UUID profileId = profileId(userId);
        ProfileImage image = images.findById(profileId).orElseGet(ProfileImage::new);
        image.setProfileId(profileId);
        image.setImageData(data);
        image.setContentType(type);
        images.save(image);
    }

    /** Returns the user's image, or HTTP 404 if the profile or image does not exist. */
    @Transactional(readOnly = true)
    public ProfileImage get(UUID userId) {
        return images.findById(profileId(userId))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Profile image not found"));
    }

    private UUID profileId(UUID userId) {
        Profile profile = users.findById(userId).map(user -> user.getProfile()).orElse(null);
        if (profile == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Profile not found");
        }
        return profile.getProfileId();
    }
}