package com.isw.financiero.service;

import com.isw.financiero.dto.CupoUpdateDTO;
import com.isw.financiero.dto.TarjetaRequestDTO;
import com.isw.financiero.model.Cliente;
import com.isw.financiero.model.Tarjeta;
import com.isw.financiero.repository.ClienteRepository;
import com.isw.financiero.repository.TarjetaRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("Pruebas unitarias — TarjetaService")
class TarjetaServiceTest {

    @Mock
    private TarjetaRepository tarjetaRepository;

    @Mock
    private ClienteRepository clienteRepository;

    @InjectMocks
    private TarjetaService tarjetaService;

    private Cliente clienteMock;

    @BeforeEach
    void setUp() {
        clienteMock = new Cliente();
        clienteMock.setId(1L);
        clienteMock.setNumeroId("123456789");
        clienteMock.setNombre("Ana García");
        clienteMock.setCorreo("ana@test.com");
    }

    // ─── Pruebas de cálculo de franquicia ────────────────────

    @Test
    @DisplayName("Debe calcular franquicia VISA para tarjeta de 16 dígitos que inicia con 4")
    void calcularFranquicia_Visa() {
        assertEquals("VISA", tarjetaService.calcularFranquicia("4111111111111111"));
    }

    @Test
    @DisplayName("Debe calcular franquicia MASTERCARD para tarjeta de 16 dígitos con prefijo 51")
    void calcularFranquicia_Mastercard_51() {
        assertEquals("MASTERCARD", tarjetaService.calcularFranquicia("5111111111111111"));
    }

    @Test
    @DisplayName("Debe calcular franquicia MASTERCARD para tarjeta de 16 dígitos con prefijo 55")
    void calcularFranquicia_Mastercard_55() {
        assertEquals("MASTERCARD", tarjetaService.calcularFranquicia("5511111111111111"));
    }

    @Test
    @DisplayName("Debe calcular franquicia AMEX para tarjeta de 15 dígitos con prefijo 34")
    void calcularFranquicia_Amex_34() {
        assertEquals("AMEX", tarjetaService.calcularFranquicia("341111111111111"));
    }

    @Test
    @DisplayName("Debe calcular franquicia AMEX para tarjeta de 15 dígitos con prefijo 37")
    void calcularFranquicia_Amex_37() {
        assertEquals("AMEX", tarjetaService.calcularFranquicia("371111111111111"));
    }

    @Test
    @DisplayName("Debe lanzar excepción para número de tarjeta inválido")
    void calcularFranquicia_Invalida() {
        IllegalArgumentException ex = assertThrows(
                IllegalArgumentException.class,
                () -> tarjetaService.calcularFranquicia("9999999999999999")
        );
        assertNotNull(ex.getMessage());
    }

    // ─── Pruebas de registro de tarjeta ──────────────────────

    @Test
    @DisplayName("Debe registrar tarjeta VISA correctamente y calcular cupo utilizado")
    void registrar_TarjetaVisa_Exitoso() {
        when(tarjetaRepository.existsByNumeroTarjeta("4111111111111111")).thenReturn(false);
        when(clienteRepository.findById(1L)).thenReturn(Optional.of(clienteMock));
        when(tarjetaRepository.save(any(Tarjeta.class))).thenAnswer(i -> i.getArgument(0));

        TarjetaRequestDTO dto = new TarjetaRequestDTO();
        dto.setNumeroTarjeta("4111111111111111");
        dto.setFechaVencimiento("12/2027");
        dto.setCupoTotal(new BigDecimal("5000000"));
        dto.setCupoDisponible(new BigDecimal("3000000"));
        dto.setClienteId(1L);

        Tarjeta result = tarjetaService.registrar(dto);

        assertEquals("VISA", result.getFranquicia());
        assertEquals("ACTIVO", result.getEstado());
        assertEquals(new BigDecimal("2000000"), result.getCupoUtilizado());
    }

    @Test
    @DisplayName("Debe lanzar excepción si el número de tarjeta ya existe")
    void registrar_NumeroTarjetaDuplicado() {
        when(tarjetaRepository.existsByNumeroTarjeta("4111111111111111")).thenReturn(true);

        TarjetaRequestDTO dto = new TarjetaRequestDTO();
        dto.setNumeroTarjeta("4111111111111111");
        dto.setFechaVencimiento("12/2027");
        dto.setCupoTotal(new BigDecimal("5000000"));
        dto.setCupoDisponible(new BigDecimal("3000000"));
        dto.setClienteId(1L);

        assertThrows(IllegalArgumentException.class, () -> tarjetaService.registrar(dto));
    }

    // ─── Prueba eliminación lógica ────────────────────────────

    @Test
    @DisplayName("Debe cambiar el estado de la tarjeta a INACTIVO")
    void cambiarEstado_AInactivo() {
        Tarjeta tarjeta = new Tarjeta();
        tarjeta.setId(1L);
        tarjeta.setEstado("ACTIVO");

        when(tarjetaRepository.findById(1L)).thenReturn(Optional.of(tarjeta));
        when(tarjetaRepository.save(any(Tarjeta.class))).thenAnswer(i -> i.getArgument(0));

        Tarjeta result = tarjetaService.cambiarEstado(1L);

        assertEquals("INACTIVO", result.getEstado());
    }

    // ─── Prueba actualización de cupo ────────────────────────

    @Test
    @DisplayName("Debe recalcular el cupo utilizado al actualizar el cupo total")
    void actualizarCupo_RecalculaCupoUtilizado() {
        Tarjeta tarjeta = new Tarjeta();
        tarjeta.setId(1L);
        tarjeta.setCupoTotal(new BigDecimal("5000000"));
        tarjeta.setCupoDisponible(new BigDecimal("3000000"));
        tarjeta.setCupoUtilizado(new BigDecimal("2000000"));

        when(tarjetaRepository.findById(1L)).thenReturn(Optional.of(tarjeta));
        when(tarjetaRepository.save(any(Tarjeta.class))).thenAnswer(i -> i.getArgument(0));

        CupoUpdateDTO dto = new CupoUpdateDTO();
        dto.setCupoTotal(new BigDecimal("8000000"));

        Tarjeta result = tarjetaService.actualizarCupo(1L, dto);

        assertEquals(new BigDecimal("8000000"), result.getCupoTotal());
        // cupoUtilizado = 8000000 - 3000000 = 5000000
        assertEquals(new BigDecimal("5000000"), result.getCupoUtilizado());
    }
}
