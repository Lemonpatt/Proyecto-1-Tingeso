package com.example.prestabanco.controllers;
import com.example.prestabanco.entities.SolicitudPrestamo;
import com.example.prestabanco.entities.Usuario;
import com.example.prestabanco.services.SolicitudPrestamoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;


@RestController
@RequestMapping("/solicitud")
@CrossOrigin("*")

public class SolicitudPrestamoController {

    @Autowired
    private SolicitudPrestamoService solicitudPrestamoService;



    @PostMapping("/crear")
    public ResponseEntity<SolicitudPrestamo> crearSolicitud(@RequestBody SolicitudPrestamo solicitud) {

            SolicitudPrestamo nuevaSolicitud = solicitudPrestamoService.crearSolicitud(solicitud);
            return ResponseEntity.ok(nuevaSolicitud);
    }

    @PostMapping("/simulacion")
    public double simulateCredit(@RequestBody SolicitudPrestamo request) {
        return solicitudPrestamoService.simulateCredit(request);
    }

    @PostMapping("/evaluar")
    public ResponseEntity<List<String>> evaluarSolicitud(@RequestBody SolicitudPrestamo solicitudPrestamo) {
        List<String> resultados = solicitudPrestamoService.cumpleRequisitos(solicitudPrestamo);
        return ResponseEntity.ok(resultados);
    }

    @PostMapping("/evaluar/costo-total")
    public ResponseEntity<List<String>> evaluarCostoTotal(@RequestBody SolicitudPrestamo solicitudPrestamo) {
        List<String> resultado = solicitudPrestamoService.TotalCostCredit(solicitudPrestamo);
        return ResponseEntity.ok(resultado);
    }

    @PutMapping("/update")
    public ResponseEntity<String> saveUser(@RequestBody SolicitudPrestamo solicitudPrestamo) {
        solicitudPrestamoService.updateSolicitud(solicitudPrestamo);
        return ResponseEntity.ok("Usuario actualizado con éxito.");
    }

    @GetMapping("/")
    public ResponseEntity<List<SolicitudPrestamo>> listSolicitudes() {
        List<SolicitudPrestamo> solicitudes = solicitudPrestamoService.getSolicitudes();
        return ResponseEntity.ok(solicitudes);
    }

    @GetMapping("/{id}")
    public ResponseEntity<SolicitudPrestamo> getSolicitudById(@PathVariable Long id) {
        SolicitudPrestamo solicitud = solicitudPrestamoService.getSolicitudPrestamoById(id);
        return ResponseEntity.ok(solicitud);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminarSolicitud(@PathVariable Long id) {

            solicitudPrestamoService.deleteSolicitud(id);
            return ResponseEntity.noContent().build();
    }

    @GetMapping("/seguimiento/{id}")
    public List<String> getSeguimiento(@PathVariable Long id) {
        List<String> solicitud = solicitudPrestamoService.getSeguimiento(id);
        return solicitud;
    }


}
