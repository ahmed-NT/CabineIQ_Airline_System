package com.royalairmaroc.auth.service;

import com.royalairmaroc.auth.dto.*;
import java.util.List;
import java.util.Map;

public interface AuthService {
    AuthResponseDTO register(RegisterRequestDTO dto);
    AuthResponseDTO login(LoginRequestDTO dto);
    boolean validateToken(String token);
    String getRoleFromToken(String token);
    List<Map<String, Object>> getAllUsers();
    void deleteUser(Long id);
    void changePassword(Long id, String newPassword);
}
