package com.icecreamhub.controller;

import com.icecreamhub.dto.AuthDtos.*;
import com.icecreamhub.security.AuthUser;
import com.icecreamhub.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public AuthResponse register(@Valid @RequestBody RegisterRequest req) {
        return authService.register(req);
    }

    @PostMapping("/login")
    public AuthResponse login(@Valid @RequestBody LoginRequest req) {
        return authService.login(req);
    }

    @GetMapping("/me")
    public UserResponse me(@AuthenticationPrincipal AuthUser auth) {
        return authService.me(auth.id());
    }

    @PutMapping("/me")
    public UserResponse updateProfile(@AuthenticationPrincipal AuthUser auth,
                                      @Valid @RequestBody UpdateProfileRequest req) {
        return authService.updateProfile(auth.id(), req);
    }
}
