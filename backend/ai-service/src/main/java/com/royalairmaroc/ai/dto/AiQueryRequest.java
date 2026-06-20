package com.royalairmaroc.ai.dto;

import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AiQueryRequest {

    private String query;

    @Builder.Default
    private List<ChatMessageDTO> conversationHistory = new ArrayList<>();
}
