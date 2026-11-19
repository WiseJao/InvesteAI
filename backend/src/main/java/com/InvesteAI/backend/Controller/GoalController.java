package com.InvesteAI.backend.Controller;

import com.InvesteAI.backend.dto.goal.request.CreateGoalRequest;
import com.InvesteAI.backend.dto.goal.request.UpdateGoalRequest;
import com.InvesteAI.backend.dto.goal.response.GoalResponse;
import com.InvesteAI.backend.security.CurrentUser;
import com.InvesteAI.backend.service.GoalService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

/**
 * REST controller for managing financial goals, investment objectives, and progress tracking.
 * <p>
 * Exposes endpoints for creating, listing, updating, and deleting financial targets scoped
 * to the authenticated user.
 * </p>
 */
@RestController
@RequestMapping("/goals")
@RequiredArgsConstructor
public class GoalController {

    private final GoalService goalService;

    /**
     * Lists all financial goals defined by the authenticated user.
     *
     * @param userId the authenticated user ID injected from the JWT token
     * @return {@link ResponseEntity} containing a list of {@link GoalResponse} items
     */
    @GetMapping
    public ResponseEntity<List<GoalResponse>> list(@CurrentUser UUID userId) {
        return ResponseEntity.ok(goalService.list(userId));
    }

    /**
     * Creates a new financial goal for the authenticated user.
     *
     * @param userId  the authenticated user ID injected from the JWT token
     * @param request the goal creation payload
     * @return {@link ResponseEntity} with HTTP 201 Created containing the saved goal
     */
    @PostMapping
    public ResponseEntity<GoalResponse> create(
            @CurrentUser UUID userId,
            @Valid @RequestBody CreateGoalRequest request
    ) {
        GoalResponse response = goalService.create(userId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * Retrieves the details of a single financial goal by its unique identifier.
     *
     * @param userId the authenticated user ID injected from the JWT token
     * @param id     the UUID of the goal
     * @return {@link ResponseEntity} containing {@link GoalResponse}
     */
    @GetMapping("/{id}")
    public ResponseEntity<GoalResponse> getById(
            @CurrentUser UUID userId,
            @PathVariable UUID id
    ) {
        return ResponseEntity.ok(goalService.getById(userId, id));
    }

    /**
     * Partially updates an existing financial goal.
     *
     * @param userId  the authenticated user ID injected from the JWT token
     * @param id      the UUID of the goal to update
     * @param request the partial update payload
     * @return {@link ResponseEntity} containing the updated goal details
     */
    @PatchMapping("/{id}")
    public ResponseEntity<GoalResponse> update(
            @CurrentUser UUID userId,
            @PathVariable UUID id,
            @RequestBody UpdateGoalRequest request
    ) {
        return ResponseEntity.ok(goalService.update(userId, id, request));
    }

    /**
     * Deletes a financial goal belonging to the authenticated user.
     *
     * @param userId the authenticated user ID injected from the JWT token
     * @param id     the UUID of the goal to delete
     * @return {@link ResponseEntity} with HTTP 204 No Content status
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
            @CurrentUser UUID userId,
            @PathVariable UUID id
    ) {
        goalService.delete(userId, id);
        return ResponseEntity.noContent().build();
    }
}
