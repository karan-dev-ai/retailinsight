package com.retailinsight.controller;

import com.retailinsight.dto.AuthDtos.*;
import com.retailinsight.model.Role;
import com.retailinsight.model.User;
import com.retailinsight.security.UserPrincipal;
import com.retailinsight.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@Tag(name = "Authentication", description = "Endpoints for login, registration, and user session")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    @Operation(summary = "Register a new retailer, wholesaler, or admin")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.ok(authService.register(request));
    }

    @PostMapping("/login")
    @Operation(summary = "Login and obtain JWT bearer token")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @GetMapping("/me")
    @Operation(summary = "Get current authenticated user profile")
    public ResponseEntity<User> getCurrentUser(@AuthenticationPrincipal UserPrincipal principal) {
        if (principal == null) {
            return ResponseEntity.status(401).build();
        }
        return ResponseEntity.ok(authService.getCurrentUser(principal.getId()));
    }

    @GetMapping("/demo-accounts")
    @Operation(summary = "Get demo credentials for instant evaluation")
    public ResponseEntity<List<Map<String, String>>> getDemoAccounts() {
        return ResponseEntity.ok(List.of(
                Map.of("role", "RETAILER", "name", "Karan Retail Mart", "email", "retailer@retailinsight.com", "username", "retailer", "password", "password123"),
                Map.of("role", "WHOLESALER", "name", "Apex Mega Distributors", "email", "wholesaler@retailinsight.com", "username", "wholesaler", "password", "password123"),
                Map.of("role", "ADMIN", "name", "Platform Admin", "email", "admin@retailinsight.com", "username", "admin", "password", "password123")
        ));
    }
}
