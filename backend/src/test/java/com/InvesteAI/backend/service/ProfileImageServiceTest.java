package com.InvesteAI.backend.service;

import com.InvesteAI.backend.interfaces.ProfileImageInterface;
import com.InvesteAI.backend.interfaces.UserInterface;
import com.InvesteAI.backend.model.Profile;
import com.InvesteAI.backend.model.ProfileImage;
import com.InvesteAI.backend.model.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class ProfileImageServiceTest {
    private final UserInterface users = mock(UserInterface.class);
    private final ProfileImageInterface images = mock(ProfileImageInterface.class);
    private final ProfileImageService service = new ProfileImageService(users, images);
    private final UUID userId = UUID.randomUUID();
    private final UUID profileId = UUID.randomUUID();
    private final byte[] png = {(byte) 0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a};

    @BeforeEach
    void setUp() {
        User user = new User();
        Profile profile = new Profile();
        profile.setProfileId(profileId);
        user.setProfile(profile);
        when(users.findById(userId)).thenReturn(Optional.of(user));
    }

    @Test
    void uploadsAndReplacesOnlyTheUsersImage() throws Exception {
        ProfileImage existing = new ProfileImage();
        existing.setProfileId(profileId);
        when(images.findById(profileId)).thenReturn(Optional.of(existing));
        service.upload(userId, new MockMultipartFile("file", "avatar.png", "image/png", png));
        assertArrayEquals(png, existing.getImageData());
        assertEquals("image/png", existing.getContentType());
        verify(images).save(existing);
        assertSame(existing, service.get(userId));
    }

    @Test
    void createsImageAndRejectsOtherUsersWithoutProfiles() throws Exception {
        service.upload(userId, new MockMultipartFile("file", "avatar.png", "image/png", png));
        verify(images).save(any(ProfileImage.class));
        assertEquals(HttpStatus.NOT_FOUND, assertThrows(ResponseStatusException.class,
                () -> service.get(UUID.randomUUID())).getStatusCode());
    }

    @Test
    void rejectsEmptyOversizedAndSpoofedImages() {
        assertEquals(HttpStatus.BAD_REQUEST, assertThrows(ResponseStatusException.class,
                () -> service.upload(userId, new MockMultipartFile("file", new byte[0]))).getStatusCode());
        assertEquals(HttpStatus.BAD_REQUEST, assertThrows(ResponseStatusException.class,
                () -> service.upload(userId, new MockMultipartFile("file", "x.png", "image/png", new byte[2 * 1024 * 1024 + 1]))).getStatusCode());
        assertEquals(HttpStatus.UNSUPPORTED_MEDIA_TYPE, assertThrows(ResponseStatusException.class,
                () -> service.upload(userId, new MockMultipartFile("file", "x.png", "image/png", new byte[]{1, 2, 3}))).getStatusCode());
        verify(images, never()).save(any());
    }

    @Test
    void missingImageReturnsNotFound() {
        assertEquals(HttpStatus.NOT_FOUND, assertThrows(ResponseStatusException.class,
                () -> service.get(userId)).getStatusCode());
    }
}