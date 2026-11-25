package com.InvesteAI.backend.Controller;

import com.InvesteAI.backend.security.CurrentUser;
import com.InvesteAI.backend.service.CashFlowRecurrenceService;
import com.InvesteAI.backend.service.CashFlowRecurrenceService.Input;
import com.InvesteAI.backend.service.CashFlowRecurrenceService.Rule;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/cashflow/recurrences")
@RequiredArgsConstructor
public class CashFlowRecurrenceController {
    private final CashFlowRecurrenceService service;

    @GetMapping
    public List<Rule> list(@CurrentUser UUID user) {
        return service.list(user);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Rule create(@CurrentUser UUID user, @RequestBody Input input) {
        return service.create(user, input);
    }

    @PutMapping("/{id}")
    public Rule update(@CurrentUser UUID user, @PathVariable UUID id, @RequestBody Input input) {
        return service.update(user, id, input);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void end(@CurrentUser UUID user, @PathVariable UUID id) {
        service.end(user, id);
    }
}
