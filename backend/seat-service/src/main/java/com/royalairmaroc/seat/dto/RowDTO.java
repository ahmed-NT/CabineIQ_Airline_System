package com.royalairmaroc.seat.dto;

import lombok.Data;
import java.util.List;

@Data
public class RowDTO {
    private Integer rowNumber;
    private String seatClass;
    private List<SeatNodeDTO> seats;
}
