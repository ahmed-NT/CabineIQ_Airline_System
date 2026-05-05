package com.royalairmaroc.auth.service;

import com.royalairmaroc.auth.dto.*;

public interface AuthService {
    AuthResponseDTO register(RegisterRequestDTO dto);
    AuthResponseDTO login(LoginRequestDTO dto);
    boolean validateToken(String token);
    String getRoleFromToken(String token);
}
