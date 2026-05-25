package com.isw.financiero.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class TarjetaRequestDTO {

    @NotBlank(message = "El número de tarjeta es obligatorio")
    @Pattern(regexp = "\\d{15,16}", message = "El número de tarjeta debe tener 15 o 16 dígitos")
    private String numeroTarjeta;

    @NotBlank(message = "La fecha de vencimiento es obligatoria")
    @Pattern(regexp = "^(0[1-9]|1[0-2])/\\d{4}$", message = "La fecha debe tener el formato MM/YYYY")
    private String fechaVencimiento;

    @NotNull(message = "El cupo total es obligatorio")
    @Positive(message = "El cupo total debe ser positivo")
    private BigDecimal cupoTotal;

    @NotNull(message = "El cupo disponible es obligatorio")
    @PositiveOrZero(message = "El cupo disponible debe ser mayor o igual a cero")
    private BigDecimal cupoDisponible;

    @NotNull(message = "El ID del cliente es obligatorio")
    private Long clienteId;
}
