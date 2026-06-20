package com.royalairmaroc.ai.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AiQueryResponse {

    private String answer;
    private String actionType;
    private Long relatedFlightId;
}
