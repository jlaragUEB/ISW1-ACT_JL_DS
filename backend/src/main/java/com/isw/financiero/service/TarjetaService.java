package com.isw.financiero.service;

import com.isw.financiero.dto.CupoUpdateDTO;
import com.isw.financiero.dto.TarjetaRequestDTO;
import com.isw.financiero.model.Cliente;
import com.isw.financiero.model.Tarjeta;
import com.isw.financiero.repository.ClienteRepository;
import com.isw.financiero.repository.TarjetaRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;

@Service
public class TarjetaService {

    private final TarjetaRepository tarjetaRepository;
    private final ClienteRepository clienteRepository;

    public TarjetaService(TarjetaRepository tarjetaRepository,
                          ClienteRepository clienteRepository) {
        this.tarjetaRepository = tarjetaRepository;
        this.clienteRepository = clienteRepository;
    }

    // ─────────────────────────────────────────────────────────
    // Listar todas las tarjetas
    // ─────────────────────────────────────────────────────────
    public List<Tarjeta> listarTodas() {
        return tarjetaRepository.findAllByOrderByCreatedAtDesc();
    }

    // ─────────────────────────────────────────────────────────
    // Registrar nueva tarjeta
    // ─────────────────────────────────────────────────────────
    public Tarjeta registrar(TarjetaRequestDTO dto) {
        // Validar unicidad del número de tarjeta
        if (tarjetaRepository.existsByNumeroTarjeta(dto.getNumeroTarjeta())) {
            throw new IllegalArgumentException("El número de tarjeta ya está registrado.");
        }

        // Validar cliente existente
        Cliente cliente = clienteRepository.findById(dto.getClienteId())
                .orElseThrow(() -> new IllegalArgumentException(
                        "No existe un cliente con ID: " + dto.getClienteId()));

        // Calcular franquicia
        String franquicia = calcularFranquicia(dto.getNumeroTarjeta());

        // Calcular cupo utilizado
        BigDecimal cupoUtilizado = dto.getCupoTotal().subtract(dto.getCupoDisponible());
        if (cupoUtilizado.compareTo(BigDecimal.ZERO) < 0) {
            throw new IllegalArgumentException(
                    "El cupo disponible no puede ser mayor al cupo total.");
        }

        Tarjeta tarjeta = new Tarjeta();
        tarjeta.setNumeroTarjeta(dto.getNumeroTarjeta());
        tarjeta.setFechaVencimiento(dto.getFechaVencimiento());
        tarjeta.setFranquicia(franquicia);
        tarjeta.setEstado("ACTIVO");
        tarjeta.setCupoTotal(dto.getCupoTotal());
        tarjeta.setCupoDisponible(dto.getCupoDisponible());
        tarjeta.setCupoUtilizado(cupoUtilizado);
        tarjeta.setCliente(cliente);

        return tarjetaRepository.save(tarjeta);
    }

    // ─────────────────────────────────────────────────────────
    // Eliminar lógicamente (ACTIVO → INACTIVO)
    // ─────────────────────────────────────────────────────────
    public Tarjeta cambiarEstado(Long id) {
        Tarjeta tarjeta = tarjetaRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException(
                        "No existe una tarjeta con ID: " + id));

        tarjeta.setEstado("INACTIVO");
        return tarjetaRepository.save(tarjeta);
    }

    // ─────────────────────────────────────────────────────────
    // Actualizar cupo total (recalcula cupo utilizado)
    // ─────────────────────────────────────────────────────────
    public Tarjeta actualizarCupo(Long id, CupoUpdateDTO dto) {
        Tarjeta tarjeta = tarjetaRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException(
                        "No existe una tarjeta con ID: " + id));

        BigDecimal nuevoCupoUtilizado = dto.getCupoTotal().subtract(tarjeta.getCupoDisponible());
        if (nuevoCupoUtilizado.compareTo(BigDecimal.ZERO) < 0) {
            throw new IllegalArgumentException(
                    "El nuevo cupo total no puede ser menor al cupo disponible actual.");
        }

        tarjeta.setCupoTotal(dto.getCupoTotal());
        tarjeta.setCupoUtilizado(nuevoCupoUtilizado);
        return tarjetaRepository.save(tarjeta);
    }

    // ─────────────────────────────────────────────────────────
    // Cálculo de franquicia (lógica de negocio)
    // ─────────────────────────────────────────────────────────
    public String calcularFranquicia(String numeroTarjeta) {
        if (numeroTarjeta == null || !numeroTarjeta.matches("\\d+")) {
            throw new IllegalArgumentException("El número de tarjeta debe contener solo dígitos.");
        }

        int longitud = numeroTarjeta.length();

        if (longitud == 16) {
            char primerDigito = numeroTarjeta.charAt(0);
            int dosPrimeros = Integer.parseInt(numeroTarjeta.substring(0, 2));

            if (primerDigito == '4') {
                return "VISA";
            }
            if (dosPrimeros >= 51 && dosPrimeros <= 55) {
                return "MASTERCARD";
            }
        }

        if (longitud == 15) {
            int dosPrimeros = Integer.parseInt(numeroTarjeta.substring(0, 2));
            if (dosPrimeros == 34 || dosPrimeros == 37) {
                return "AMEX";
            }
        }

        throw new IllegalArgumentException(
                "El número de tarjeta no corresponde a ninguna franquicia válida (VISA, MASTERCARD o AMEX).");
    }
}
