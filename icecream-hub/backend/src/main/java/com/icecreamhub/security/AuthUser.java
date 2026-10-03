package com.icecreamhub.security;

import com.icecreamhub.model.Role;

/** The authenticated principal stored in the SecurityContext. */
public record AuthUser(Long id, String email, Role role) {}
