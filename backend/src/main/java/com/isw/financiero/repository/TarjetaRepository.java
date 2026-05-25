package com.isw.financiero.repository;

import com.isw.financiero.model.Tarjeta;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TarjetaRepository extends JpaRepository<Tarjeta, Long> {

    boolean existsByNumeroTarjeta(String numeroTarjeta);

    List<Tarjeta> findAllByOrderByCreatedAtDesc();
}
