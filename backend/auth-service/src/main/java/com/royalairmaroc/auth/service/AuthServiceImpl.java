package com.royalairmaroc.auth.service;

import com.royalairmaroc.auth.dto.*;
import com.royalairmaroc.auth.entity.User;
import com.royalairmaroc.auth.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;

    @Override
    public AuthResponseDTO register(RegisterRequestDTO dto) {
        if (userRepository.existsByUsername(dto.getUsername())) {
            throw new RuntimeException("Username already exists");
        }
        if (userRepository.existsByEmail(dto.getEmail())) {
            throw new RuntimeException("Email already exists");
        }
        User user = User.builder()
            .username(dto.getUsername())
            .password(passwordEncoder.encode(dto.getPassword()))
            .email(dto.getEmail())
            .role(User.Role.valueOf(
                dto.getRole().toUpperCase()))
            .build();
        userRepository.save(user);
        String token = jwtService.generateToken(
            user.getUsername(), user.getRole().name());
        return new AuthResponseDTO(token, user.getUsername(),
            user.getRole().name(), "Registration successful");
    }

    @Override
    public AuthResponseDTO login(LoginRequestDTO dto) {
        User user = userRepository
            .findByUsername(dto.getUsername())
            .orElseThrow(() -> new RuntimeException(
                "Invalid username or password"));
        if (!passwordEncoder.matches(
                dto.getPassword(), user.getPassword())) {
            throw new RuntimeException(
                "Invalid username or password");
        }
        String token = jwtService.generateToken(
            user.getUsername(), user.getRole().name());
        return new AuthResponseDTO(token, user.getUsername(),
            user.getRole().name(), "Login successful");
    }

    @Override
    public boolean validateToken(String token) {
        return jwtService.isTokenValid(token);
    }

    @Override
    public String getRoleFromToken(String token) {
        return jwtService.extractRole(token);
    }

    @Override
    public List<Map<String, Object>> getAllUsers() {
        return userRepository.findAll().stream()
            .map(u -> Map.<String, Object>of(
                "id", u.getId(),
                "username", u.getUsername(),
                "email", u.getEmail(),
                "role", u.getRole().name(),
                "createdAt", u.getCreatedAt() != null ? u.getCreatedAt().toString() : ""
            ))
            .collect(Collectors.toList());
    }

    @Override
    public void deleteUser(Long id) {
        userRepository.deleteById(id);
    }

    @Override
    public void changePassword(Long id, String newPassword) {
        User user = userRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("User not found"));
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }
}
