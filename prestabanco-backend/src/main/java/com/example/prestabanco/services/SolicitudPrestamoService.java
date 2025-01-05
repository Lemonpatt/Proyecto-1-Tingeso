package com.example.prestabanco.services;

import com.example.prestabanco.entities.SolicitudPrestamo;
import com.example.prestabanco.entities.Usuario;
import com.example.prestabanco.repositories.SolicitudPrestamoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

import static java.util.Objects.isNull;

@Service
public class SolicitudPrestamoService {
    @Autowired
    private SolicitudPrestamoRepository solicitudPrestamoRepository;

    public SolicitudPrestamo crearSolicitud(SolicitudPrestamo solicitud) {

        return solicitudPrestamoRepository.save(solicitud);

    }

    public List<SolicitudPrestamo> getSolicitudes() {
        return solicitudPrestamoRepository.findAll();
    }

    public SolicitudPrestamo updateSolicitud(SolicitudPrestamo solicitud) {
        return solicitudPrestamoRepository.save(solicitud);
    }
    public SolicitudPrestamo getSolicitudPrestamoById(Long id) {
        return solicitudPrestamoRepository.findById(id).orElse(null);
    }
    public void deleteSolicitud(Long id) {

        solicitudPrestamoRepository.deleteById(id);

    }

    public List<String> cumpleRequisitos(SolicitudPrestamo solicitudPrestamo) {
        List<String> resultados = new ArrayList<>();
        Usuario usuario = solicitudPrestamo.getUsuario();
        double cuotaMensual = simulateCredit(solicitudPrestamo);
        double relacionCuotaIngreso = (cuotaMensual / (double) usuario.getSalario()) * 100;

        // R1: Relación cuota/ingreso
        if (relacionCuotaIngreso > 35) {
            resultados.add("R1: Relación Cuota/Ingreso - No cumple (La relación es " + relacionCuotaIngreso + "%, supera el 35%)");
        } else {
            resultados.add("R1: Relación Cuota/Ingreso - Cumple (La relación es " + relacionCuotaIngreso + "%)");
        }

        List<Double> deudasMensuales = solicitudPrestamo.getDeudasMensuales();
        long countDeudas = deudasMensuales.stream().filter(deuda -> deuda != 0.0).count();
        if (countDeudas > 6) {
            resultados.add("R2: Historial Crediticio - No cumple (Más de la mitad de los meses tienen deudas activas)");
        } else {
            resultados.add("R2: Historial Crediticio - Cumple (Historial de deudas dentro del límite permitido)");
        }

        // R3: Antigüedad Laboral y Estabilidad
        int antiguedadLaboral = solicitudPrestamo.getAntiguedadTrabajo();
        if (antiguedadLaboral < 1 && !Objects.equals(solicitudPrestamo.getTipoTrabajo(), "Independiente")) {
            resultados.add("R3: Antigüedad Laboral - No cumple con la antigüedad de trabajo, demasiado poco.");
        } else if (antiguedadLaboral > 2 && Objects.equals(solicitudPrestamo.getTipoTrabajo(), "Independiente")) {
            resultados.add("R3: Antigüedad Laboral - Cumple Antigüedad de " + antiguedadLaboral + " años como trabajador independiente");

        }
        else {
            resultados.add("R3: Antigüedad Laboral - Cumple (Antigüedad de " + antiguedadLaboral + " años)");
        }

        double relacionDeudaIngreso = ((usuario.getDeudaTotal() + cuotaMensual) / (double) usuario.getSalario()) *100;
        if (relacionDeudaIngreso > 50) {
            resultados.add("R4: Relación Deuda/Ingreso - No cumple (La relación es " + relacionDeudaIngreso + "%, supera el 50%)");
        } else {
            resultados.add("R4: Relación Deuda/Ingreso - Cumple (La relación es " + relacionDeudaIngreso + "%)");
        }

        double porcentajeFinanciado = solicitudPrestamo.getFinanciamiento();
        if ("Primera Vivienda".equalsIgnoreCase(solicitudPrestamo.getTipoPrestamo()) && porcentajeFinanciado > 80) {
            resultados.add("R5: Monto Máximo de Financiamiento - No cumple (Financiado " + (porcentajeFinanciado) + "%, el máximo es 80% para Primera Vivienda)");
        } else if ("Segunda Vivienda".equalsIgnoreCase(solicitudPrestamo.getTipoPrestamo()) && porcentajeFinanciado > 70) {
            resultados.add("R5: Monto Máximo de Financiamiento - No cumple (Financiado " + (porcentajeFinanciado) + "%, el máximo es 70% para Segunda Vivienda)");
        } else if ("Propiedades Comerciales".equalsIgnoreCase(solicitudPrestamo.getTipoPrestamo()) && porcentajeFinanciado > 60) {
            resultados.add("R5: Monto Máximo de Financiamiento - No cumple (Financiado " + (porcentajeFinanciado) + "%, el máximo es 60% para Propiedades Comerciales)");
        } else if ("Remodelación".equalsIgnoreCase(solicitudPrestamo.getTipoPrestamo()) && porcentajeFinanciado > 50){
            resultados.add("R5: Monto Máximo de Financiamiento - No Cumple (Financiado " + (porcentajeFinanciado) + "%, el máximo es 50% para Remodelación)");
        } else {
            resultados.add("R5: Monto Máximo de Financiamiento - Cumple el máximo permitido por el tipo de préstamo");
        }

        // R6: Edad máxima
        int edadMaxima = 75;
        int edadSolicitante = usuario.getEdad();
        int plazoCredito = solicitudPrestamo.getPlazo();
        if (edadSolicitante + plazoCredito > edadMaxima) {
            resultados.add("R6: Edad del Solicitante - No cumple (El solicitante tendría " + (edadSolicitante + plazoCredito) + " años al finalizar el préstamo, excede el límite de 75 años)");
        } else {
            resultados.add("R6: Edad del Solicitante - Cumple (El solicitante tendría " + (edadSolicitante + plazoCredito) + " años al finalizar el préstamo)");
        }

        return resultados;
    }

    public double simulateCredit(SolicitudPrestamo request) {
        double montoPrestamo;
        if (request.getFinanciamiento() != 0) {
            montoPrestamo = request.getValorPropiedad() * request.getFinanciamiento()/100;
        } else {
            montoPrestamo = request.getValorPropiedad();
        }
            int pagos = request.getPlazo() * 12;
            double tasaInteresMensual = request.getInteres() / 12 / 100;

            // Fórmula para calcular la cuota mensual
            double cuotaMensual = montoPrestamo * ((tasaInteresMensual * Math.pow(1 + tasaInteresMensual, pagos)) /
                    (Math.pow(1 + tasaInteresMensual, pagos) - 1));

            return cuotaMensual;
        }

    public List<String> TotalCostCredit(SolicitudPrestamo request) {
        List<String> mensajes = new ArrayList<>();
        double cuotaPrestamo;
        double montoPrestamo;

        cuotaPrestamo = request.getCuotaMensual();
        montoPrestamo = (double) request.getValorPropiedad() * request.getFinanciamiento() / 100;

        double comisionAdmin = montoPrestamo * request.getComision() / 100;
        double desgravamen = montoPrestamo * request.getSeguroDegravamen() / 100;

        double cuotaMensualNueva = cuotaPrestamo + desgravamen + request.getSeguroIncendio();

        int costoTotal = (int) (cuotaMensualNueva * request.getPlazo() * 12 + comisionAdmin);

        mensajes.add("Calculando los valores del préstamo queda lo siguiente:");
        mensajes.add("Seguro de degravamen: $" + Math.floor(desgravamen) + " Mensuales");
        mensajes.add("Costo de comisión por Administración: $" + Math.floor(comisionAdmin) + " Monto único añadido al total");
        mensajes.add("El costo total del préstamo quedará en $" + costoTotal + ", mientras que el valor de la cuota será $" + Math.floor(cuotaMensualNueva) + ".");

        return mensajes;
    }

    public List<String> getSeguimiento(Long id) {
        List<String> seguimiento = new ArrayList<>();
        SolicitudPrestamo solicitud = getSolicitudPrestamoById(id);

        String estado = solicitud.getEstado();

        if (Objects.equals(estado, "Pendiente de documentacion")){
            seguimiento.add("Vista de Cliente");
            seguimiento.add("Su solicitud no procederá hasta que haya provisto todos los documentos pedidos (REHACER SOLICITUD)");
        }
        else if (Objects.equals(estado, "En evaluación")){
            seguimiento.add("Vista de Ejecutivo");
            seguimiento.add("Se evalúa la solicitud en primera instancia");
            seguimiento.add("Revisar cuidadosamente los resultados para ver si se debería tomar en cuenta la solicitud");
        }
        else if (Objects.equals(estado, "Pre-Aprobada")){
            seguimiento.add("Vista de Cliente");
            seguimiento.add("Su solicitud Cumple los criterios básicos, a continuación se presentan las condiciones iniciales del crédito");
        }
        else if (Objects.equals(estado, "En Aprobación Final")){
            seguimiento.add("Vista de Ejecutivo");
            seguimiento.add("El cliente aceptó las condiciones, revisar detalles finales");
        }
        else if (Objects.equals(estado, "Aprobada")){
            seguimiento.add("Vista de Cliente");
            seguimiento.add("La solicitud ha sido aprobada, el proceso de desembolso empezará en las siguientes semanas");
        }
        else if (Objects.equals(estado, "En Desembolso")){
            seguimiento.add("Vista de Ejecutivo");
            seguimiento.add("La solicitud se encuentra en el proceso de desembolso");
        }

        return seguimiento;


    }
}
