package tn.esprit.job.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tn.esprit.job.model.ReponseClient;
import tn.esprit.job.service.ReponseClientService;

import java.util.List;

@RestController
@RequestMapping("/api/reponse-client")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class ReponseClientController {

    private final ReponseClientService service;

    @PostMapping
    public ResponseEntity<ReponseClient> create(@RequestBody ReponseClient rc) {
        return ResponseEntity.ok(service.create(rc));
    }

    @GetMapping
    public ResponseEntity<List<ReponseClient>> getAll() {
        return ResponseEntity.ok(service.getAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ReponseClient> getById(@PathVariable Long id) {
        return ResponseEntity.ok(service.getById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ReponseClient> update(@PathVariable Long id, @RequestBody ReponseClient rc) {
        return ResponseEntity.ok(service.update(id, rc));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
