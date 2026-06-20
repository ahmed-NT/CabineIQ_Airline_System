package com.royalairmaroc.ai;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.web.reactive.function.client.WebClient;

@SpringBootApplication
public class AiServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(AiServiceApplication.class, args);
    }

    @Bean
    public WebClient webClient() {
        return WebClient.builder().build();
    }
}
