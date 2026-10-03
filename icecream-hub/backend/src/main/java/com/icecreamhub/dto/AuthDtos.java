package com.icecreamhub.dto;

import com.icecreamhub.model.User;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public final class AuthDtos {

    private AuthDtos() {}

    public record RegisterRequest(
            @NotBlank String name,
            @NotBlank @Email String email,
            @NotBlank @Size(min = 6, message = "must be at least 6 characters") String password,
            String phone,
            String address) {}

    public record LoginRequest(
            @NotBlank @Email String email,
            @NotBlank String password) {}

    public record UpdateProfileRequest(
            @NotBlank String name,
            String phone,
            String address) {}

    public record UserResponse(Long id, String name, String email, String phone, String address, String role) {
        public static UserResponse from(User u) {
            return new UserResponse(u.getId(), u.getName(), u.getEmail(), u.getPhone(), u.getAddress(), u.getRole().name());
        }
    }

    public record AuthResponse(String token, UserResponse user) {}
}
