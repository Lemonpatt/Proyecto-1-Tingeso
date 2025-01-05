package com.example.prestabanco.entities;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;


@Entity
@Table(name = "usuarios")
@Data
@NoArgsConstructor
@AllArgsConstructor

public class Usuario{

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(unique = true, nullable = false)
    private Long id;

    private String nombre;
    private String rut;
    private int edad;
    private int salario;
    private int saldoCuenta;
    private int antiguedadCuenta;
    private int deudaTotal;
    private String nombreArchivo;
    @Getter
    @Lob
    private String documento;
}