package tn.esprit.job.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tn.esprit.job.model.ReponseFournisseur;
import tn.esprit.job.service.ReponseFournisseurService;

import java.util.List;

@RestController
@RequestMapping("/api/reponse-fournisseur")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class ReponseFournisseurController {

    private final ReponseFournisseurService service;

    @PostMapping
    public ResponseEntity<ReponseFournisseur> create(@RequestBody ReponseFournisseur rf) {
        return ResponseEntity.ok(service.create(rf));
    }

    @GetMapping
    public ResponseEntity<List<ReponseFournisseur>> getAll() {
        return ResponseEntity.ok(service.getAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ReponseFournisseur> getById(@PathVariable Long id) {
        return ResponseEntity.ok(service.getById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ReponseFournisseur> update(@PathVariable Long id, @RequestBody ReponseFournisseur rf) {
        return ResponseEntity.ok(service.update(id, rf));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
