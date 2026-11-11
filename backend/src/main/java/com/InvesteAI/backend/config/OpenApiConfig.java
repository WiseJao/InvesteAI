package com.InvesteAI.backend.config;

import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.enums.SecuritySchemeIn;
import io.swagger.v3.oas.annotations.enums.SecuritySchemeType;
import io.swagger.v3.oas.annotations.info.Info;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.security.SecurityScheme;
import org.springframework.context.annotation.Configuration;

/**
 * OpenAPI 3.0 metadata and JWT Bearer security scheme.
 * Enables testing authenticated endpoints directly from Swagger UI — RNF-06.
 */
@Configuration
@OpenAPIDefinition(
    info = @Info(
        title       = "InvesteAI-API",
        version     = "0.1",
        description = "Sistema de controle de Investimentos e Gastos, projeto de conclusão de curso"
    ),
    security = @SecurityRequirement(name = "bearerAuth")
)
@SecurityScheme(
    name         = "bearerAuth",
    type         = SecuritySchemeType.HTTP,
    scheme       = "bearer",
    bearerFormat = "JWT",
    in           = SecuritySchemeIn.HEADER
)
public class OpenApiConfig {}
