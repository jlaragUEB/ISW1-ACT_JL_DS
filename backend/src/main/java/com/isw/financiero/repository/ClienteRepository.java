package com.isw.financiero.repository;

import com.isw.financiero.model.Cliente;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ClienteRepository extends JpaRepository<Cliente, Long> {

    boolean existsByNumeroId(String numeroId);

    boolean existsByCorreo(String correo);

    Optional<Cliente> findByNumeroId(String numeroId);
}
