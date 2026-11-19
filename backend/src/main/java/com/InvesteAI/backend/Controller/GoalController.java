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

@RestController
@RequestMapping("/goals")
@RequiredArgsConstructor
public class GoalController {

    private final GoalService goalService;

    @GetMapping
    public ResponseEntity<List<GoalResponse>> list(@CurrentUser UUID userId) {
        return ResponseEntity.ok(goalService.list(userId));
    }

    @PostMapping
    public ResponseEntity<GoalResponse> create(
            @CurrentUser UUID userId,
            @Valid @RequestBody CreateGoalRequest request
    ) {
        GoalResponse response = goalService.create(userId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<GoalResponse> getById(
            @CurrentUser UUID userId,
            @PathVariable UUID id
    ) {
        return ResponseEntity.ok(goalService.getById(userId, id));
    }

    @PatchMapping("/{id}")
    public ResponseEntity<GoalResponse> update(
            @CurrentUser UUID userId,
            @PathVariable UUID id,
            @RequestBody UpdateGoalRequest request
    ) {
        return ResponseEntity.ok(goalService.update(userId, id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
            @CurrentUser UUID userId,
            @PathVariable UUID id
    ) {
        goalService.delete(userId, id);
        return ResponseEntity.noContent().build();
    }
}
