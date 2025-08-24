package tn.esprit.job.controller;

import lombok.RequiredArgsConstructor;
import lombok.Getter;
import lombok.Setter;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import tn.esprit.job.dto.*;
import tn.esprit.job.model.Formulaire;
import tn.esprit.job.model.User;
import tn.esprit.job.service.FormulaireService;
import tn.esprit.job.service.QuestionService;
import tn.esprit.job.service.ReponseClientService;

import java.util.List;

@RestController
@RequestMapping("/api/formulaires")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class FormulaireController {

    private final FormulaireService formulaireService;
    private final QuestionService questionService;
    private final ReponseClientService reponseClientService;

    // -------- Public read (DTOs) --------
    @GetMapping
    public ResponseEntity<List<FormulaireListDTO>> list() {
        return ResponseEntity.ok(formulaireService.listAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<FormulaireDetailDTO> detail(@PathVariable Long id) {
        return ResponseEntity.ok(formulaireService.getDetail(id));
    }

    // -------- Admin-like CRUD (entities) --------
    @PostMapping("/user/{userId}")
    public ResponseEntity<Formulaire> createFormulaire(@RequestBody Formulaire formulaire,
                                                       @PathVariable Long userId) {
        return ResponseEntity.ok(formulaireService.createFormulaire(formulaire, userId));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Formulaire> updateFormulaire(@PathVariable Long id,
                                                       @RequestBody Formulaire formulaire) {
        return ResponseEntity.ok(formulaireService.updateFormulaire(id, formulaire));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteFormulaire(@PathVariable Long id) {
        formulaireService.deleteFormulaire(id);
        return ResponseEntity.noContent().build();
    }

    // -------- Questions membership --------
    @GetMapping("/{id}/questions")
    public ResponseEntity<List<Long>> getQuestionIdsOfFormulaire(@PathVariable Long id) {
        return ResponseEntity.ok(questionService.getQuestionIdsOfFormulaire(id));
    }

    @PutMapping("/{id}/questions")
    public ResponseEntity<Void> replaceFormulaireQuestions(@PathVariable Long id,
                                                           @RequestBody UpdateFormulaireQuestionsRequest body) {
        questionService.replaceMembership(id, body.getQuestionIds());
        return ResponseEntity.noContent().build();
    }

    // -------- Client submissions (no auth → userId in body or query) --------
    @PostMapping("/{formulaireId}/submit")
    public ResponseEntity<List<ReponseClientDTO>> submit(
            @PathVariable Long formulaireId,
            @RequestBody SubmissionDTO payload,
            @AuthenticationPrincipal User user
    ) {
        return ResponseEntity.ok(
                reponseClientService.submitForFormulaire(formulaireId, payload, user)
        );
    }

    @GetMapping("/{formulaireId}/responses/me")
    public ResponseEntity<List<ReponseClientDTO>> myResponsesForFormulaire(
            @PathVariable Long formulaireId,
            @AuthenticationPrincipal User currentUser
    ) {
        return ResponseEntity.ok(
                reponseClientService.myResponsesForFormulaire(formulaireId, currentUser)
        );
    }
}
