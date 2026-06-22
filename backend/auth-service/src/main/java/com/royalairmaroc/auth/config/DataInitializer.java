package com.royalairmaroc.auth.config;

import com.royalairmaroc.auth.entity.User;
import com.royalairmaroc.auth.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        if (!userRepository.existsByUsername("admin")) {
            User admin = User.builder()
                    .username("admin")
                    .password(passwordEncoder.encode("admin123"))
                    .email("admin@royalairmaroc.ma")
                    .role(User.Role.ADMIN)
                    .build();
            userRepository.save(admin);
            log.info("Compte admin créé — username: admin / password: admin123");
        } else {
            log.info("Compte admin déjà existant, initialisation ignorée.");
        }
    }
}
