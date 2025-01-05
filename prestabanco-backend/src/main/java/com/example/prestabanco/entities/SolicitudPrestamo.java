package com.example.prestabanco.entities;

import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;


@Entity
@Table(name = "solicitudPrestamos")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Setter
@Getter
public class  SolicitudPrestamo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Relación con Usuario (muchas solicitudes pueden pertenecer a un usuario)

    private String correo;

    private String telefono;

    private int valorPropiedad;

    @ElementCollection
    private List<String> nombreArchivos;

    @ElementCollection
    @CollectionTable(name = "solicitud_documentos", joinColumns = @JoinColumn(name = "solicitud_id"))
    @Column(name = "documento", columnDefinition = "TEXT") // Especifica que es un texto largo
    private List<String> documentos;

    private String tipoPrestamo;

    private int antiguedadTrabajo; // Años de antigüedad en el trabajo

    private String tipoTrabajo;

    private int plazo;

    private double interes;

    private double seguroDegravamen;

    private int seguroIncendio;

    private double comision;

    private double financiamiento;

    private double cuotaMensual;

    @ElementCollection
    @CollectionTable(name = "solicitud_ingresos", joinColumns = @JoinColumn(name = "solicitud_id"))
    @Column(name = "ingreso")
    private List<Double> ingresosMensuales = new ArrayList<>(Collections.nCopies(12, 0.0));

    // Nueva lista para los retiros de la cuenta de cada mes (12 meses)
    @ElementCollection
    @CollectionTable(name = "solicitud_deudas", joinColumns = @JoinColumn(name = "solicitud_id"))
    @Column(name = "deuda")
    private List<Double> deudasMensuales = new ArrayList<>(Collections.nCopies(12, 0.0));

    private String estado;
    @ManyToOne
    @JoinColumn(name = "usuario_id")
    private Usuario usuario;

}