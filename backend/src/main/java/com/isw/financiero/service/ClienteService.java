package com.isw.financiero.service;

import com.isw.financiero.dto.ClienteRequestDTO;
import com.isw.financiero.model.Cliente;
import com.isw.financiero.repository.ClienteRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ClienteService {

    private final ClienteRepository clienteRepository;

    public ClienteService(ClienteRepository clienteRepository) {
        this.clienteRepository = clienteRepository;
    }

    public List<Cliente> listarTodos() {
        return clienteRepository.findAll();
    }

    public Cliente registrar(ClienteRequestDTO dto) {
        if (clienteRepository.existsByNumeroId(dto.getNumeroId())) {
            throw new IllegalArgumentException("Ya existe un cliente con ese número de identificación.");
        }
        if (clienteRepository.existsByCorreo(dto.getCorreo())) {
            throw new IllegalArgumentException("Ya existe un cliente con ese correo electrónico.");
        }

        Cliente cliente = new Cliente();
        cliente.setNumeroId(dto.getNumeroId());
        cliente.setNombre(dto.getNombre());
        cliente.setCorreo(dto.getCorreo());
        cliente.setActivo(true);

        return clienteRepository.save(cliente);
    }
}
