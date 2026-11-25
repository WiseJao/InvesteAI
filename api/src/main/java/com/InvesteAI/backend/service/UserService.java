package com.InvesteAI.backend.service;

import com.InvesteAI.backend.interfaces.UserInterface;
import org.springframework.stereotype.Service;

import com.InvesteAI.backend.model.User;

import java.util.UUID;
import java.math.BigDecimal;
import tools.jackson.databind.JsonNode;
import com.InvesteAI.backend.validation.PersistedFields;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

@Service 
public class UserService {
    private final UserInterface ur;

    public UserService(UserInterface ur){
        this.ur = ur;
    }


    public User buscarUsuario(UUID id) {
        return ur.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    @Transactional
    public User updateProfile(UUID id, JsonNode changes) {
        if (!changes.isObject()) throw PersistedFields.invalid("perfil");
        User user = buscarUsuario(id);
        var profile = user.getProfile();
        if (profile == null) throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Perfil não encontrado.");
        if (changes.has("name")) {
            String name = optionalText(changes.get("name"), 255, "nome");
            PersistedFields.text(name, 255, "nome");
            profile.setName(name);
        }
        if (changes.has("nickname")) profile.setNickname(optionalText(changes.get("nickname"), 255, "apelido"));
        if (changes.has("occupation")) profile.setOccupation(optionalText(changes.get("occupation"), 255, "ocupação"));
        if (changes.has("salary")) {
            var value = changes.get("salary");
            BigDecimal salary = null;
            if (!value.isNull()) {
                if (!value.isNumber() && !value.isTextual()) throw PersistedFields.invalid("renda");
                try {
                    salary = new BigDecimal(value.asText());
                } catch (NumberFormatException ex) {
                    throw PersistedFields.invalid("renda");
                }
                PersistedFields.money(salary, false, "renda");
            }
            profile.setSalary(salary);
        }
        return user;
    }

    private String optionalText(JsonNode value, int length, String field) {
        if (value.isNull()) return null;
        if (!value.isTextual()) throw PersistedFields.invalid(field);
        String text = value.asText().strip();
        PersistedFields.optionalText(text, length, field);
        return text.isEmpty() ? null : text;
    }
}
