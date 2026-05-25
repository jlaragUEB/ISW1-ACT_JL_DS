package com.isw.financiero.controller;

import com.isw.financiero.dto.CupoUpdateDTO;
import com.isw.financiero.dto.TarjetaRequestDTO;
import com.isw.financiero.model.Tarjeta;
import com.isw.financiero.service.TarjetaService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/tarjetas")
public class TarjetaController {

    private final TarjetaService tarjetaService;

    public TarjetaController(TarjetaService tarjetaService) {
        this.tarjetaService = tarjetaService;
    }

    @GetMapping
    public ResponseEntity<List<Tarjeta>> listar() {
        return ResponseEntity.ok(tarjetaService.listarTodas());
    }

    @PostMapping
    public ResponseEntity<?> registrar(@Valid @RequestBody TarjetaRequestDTO dto) {
        try {
            Tarjeta tarjeta = tarjetaService.registrar(dto);
            return ResponseEntity.status(HttpStatus.CREATED).body(tarjeta);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PatchMapping("/{id}/estado")
    public ResponseEntity<?> eliminarLogico(@PathVariable Long id) {
        try {
            Tarjeta tarjeta = tarjetaService.cambiarEstado(id);
            return ResponseEntity.ok(tarjeta);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/{id}/cupo")
    public ResponseEntity<?> actualizarCupo(
            @PathVariable Long id,
            @Valid @RequestBody CupoUpdateDTO dto) {
        try {
            Tarjeta tarjeta = tarjetaService.actualizarCupo(id, dto);
            return ResponseEntity.ok(tarjeta);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
