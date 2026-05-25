package com.isw.financiero.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "tarjetas")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Tarjeta {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "numero_tarjeta", nullable = false, unique = true, length = 16)
    private String numeroTarjeta;

    @Column(name = "fecha_vencimiento", nullable = false, length = 7)
    private String fechaVencimiento;  // Formato MM/YYYY

    @Column(nullable = false, length = 20)
    private String franquicia;  // VISA | MASTERCARD | AMEX

    @Column(nullable = false, length = 10)
    private String estado = "ACTIVO";  // ACTIVO | INACTIVO

    @Column(name = "cupo_total", nullable = false, precision = 15, scale = 2)
    private BigDecimal cupoTotal;

    @Column(name = "cupo_disponible", nullable = false, precision = 15, scale = 2)
    private BigDecimal cupoDisponible;

    @Column(name = "cupo_utilizado", nullable = false, precision = 15, scale = 2)
    private BigDecimal cupoUtilizado;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cliente_id", nullable = false)
    private Cliente cliente;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.estado = "ACTIVO";
    }
}
