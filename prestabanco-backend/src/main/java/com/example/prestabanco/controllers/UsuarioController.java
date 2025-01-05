package com.example.prestabanco.controllers;

import com.example.prestabanco.entities.Usuario;
import com.example.prestabanco.services.UsuarioService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/usuarios")
@CrossOrigin("*")
public class UsuarioController {

    @Autowired
    private UsuarioService usuarioService;

    @GetMapping("/")
    public ResponseEntity<List<Usuario>> listUsuarios() {
        List<Usuario> usuarios = usuarioService.getUsuarios();
        return ResponseEntity.ok(usuarios);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Usuario> getUserByID(@PathVariable Long id) {
        Usuario user = usuarioService.getUserByID(id);
        return ResponseEntity.ok(user);
    }



    @PostMapping("/crear")
    public ResponseEntity<String> registrarUsuario(@RequestBody Usuario user) {
            usuarioService.guardarUsuario(user);

            return ResponseEntity.ok("Usuario registrado con éxito.");
    }

    @PutMapping("/update")
    public ResponseEntity<String> saveUser(@RequestBody Usuario user) {
        usuarioService.updateUser(user);

        return ResponseEntity.ok("Usuario actualizado con éxito.");
    }


    @DeleteMapping("/{id}")
    public ResponseEntity<Boolean> deleteUser(@PathVariable Long id) throws Exception {
        usuarioService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }

}