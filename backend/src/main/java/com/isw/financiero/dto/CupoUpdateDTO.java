package com.isw.financiero.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class CupoUpdateDTO {

    @NotNull(message = "El nuevo cupo total es obligatorio")
    @Positive(message = "El cupo total debe ser positivo")
    private BigDecimal cupoTotal;
}
