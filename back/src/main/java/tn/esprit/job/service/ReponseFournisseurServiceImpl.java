package tn.esprit.job.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import tn.esprit.job.dto.ClientAnswerViewDTO;
import tn.esprit.job.dto.UpsertFournisseurResponseRequest;
import tn.esprit.job.model.ReponseClient;
import tn.esprit.job.model.ReponseFournisseur;
import tn.esprit.job.model.User;
import tn.esprit.job.repository.ReponseClientRepository;
import tn.esprit.job.repository.ReponseFournisseurRepository;
import tn.esprit.job.repository.UserRepository;

import java.util.Date;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ReponseFournisseurServiceImpl implements ReponseFournisseurService {

    private final ReponseFournisseurRepository repository;
    private final ReponseClientRepository reponseClientRepository;
    private final UserRepository userRepository;

    @Override
    public ReponseFournisseur create(ReponseFournisseur reponse) {
        reponse.setDateReponse(new Date());

        if (reponse.getReponseClient() != null && reponse.getReponseClient().getId_RClient() != null) {
            ReponseClient client = reponseClientRepository.findById(reponse.getReponseClient().getId_RClient())
                    .orElseThrow(() -> new RuntimeException("ReponseClient not found"));
            reponse.setReponseClient(client);
        }

        if (reponse.getUser() != null && reponse.getUser().getUserId() != null) {
            User user = userRepository.findById(reponse.getUser().getUserId())
                    .orElseThrow(() -> new RuntimeException("User not found"));
            reponse.setUser(user);
        }

        return repository.save(reponse);
    }

    @Override
    public List<ReponseFournisseur> getAll() {
        return repository.findAll();
    }

    @Override
    public ReponseFournisseur getById(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new RuntimeException("ReponseFournisseur not found with ID: " + id));
    }

    @Override
    public ReponseFournisseur update(Long id, ReponseFournisseur updated) {
        ReponseFournisseur existing = getById(id);
        existing.setCommentaire(updated.getCommentaire());
        return repository.save(existing);
    }

    @Override
    public void delete(Long id) {
        if (!repository.existsById(id)) {
            throw new RuntimeException("Cannot delete. ReponseFournisseur not found with ID: " + id);
        }
        repository.deleteById(id);
    }

    @Override
    public List<ClientAnswerViewDTO> listAnswersForFormulaire(Long formulaireId,
                                                              Long clientUserIdOrNull,
                                                              User currentFournisseur) {
        List<ReponseClient> rcs = (clientUserIdOrNull != null)
                ? reponseClientRepository.findAllByUserIdAndFormulaireId(clientUserIdOrNull, formulaireId)
                : reponseClientRepository.findAllByFormulaireId(formulaireId);

        return rcs.stream().map(rc -> {
            var q = rc.getQuestion();
            var client = rc.getUser();

            var rfOpt = repository.findByReponseClientIdAndUserId(
                    rc.getId_RClient(), currentFournisseur.getUserId()
            );

            return ClientAnswerViewDTO.builder()
                    .reponseClientId(rc.getId_RClient())
                    .questionId(q != null ? q.getId_Q() : null)
                    .questionLabel(q != null ? q.getContenu() : null)
                    .questionType(q != null ? q.getType() : null)
                    .clientUserId(client != null ? client.getUserId() : null)
                    .clientEmail(client != null ? client.getEmail() : null)
                    .clientAnswer(rc.getValeur())
                    .submittedAt(rc.getDateSoumission())
                    .fournisseurResponseId(rfOpt.map(ReponseFournisseur::getId_RFournisseur).orElse(null))
                    .fournisseurComment(rfOpt.map(ReponseFournisseur::getCommentaire).orElse(null))
                    .fournisseurRespondedAt(rfOpt.map(ReponseFournisseur::getDateReponse).orElse(null))
                    .build();
        }).toList();
    }

    @Override
    public ReponseFournisseur upsertOne(UpsertFournisseurResponseRequest req, User currentFournisseur) {
        if (req.getReponseClientId() == null) {
            throw new IllegalArgumentException("reponseClientId is required");
        }
        var rc = reponseClientRepository.findById(req.getReponseClientId())
                .orElseThrow(() -> new RuntimeException("ReponseClient not found"));

        var existing = repository.findByReponseClientIdAndUserId(rc.getId_RClient(), currentFournisseur.getUserId())
                .orElse(null);

        if (existing != null) {
            existing.setCommentaire(req.getCommentaire());
            existing.setDateReponse(new Date());
            return repository.save(existing);
        }

        var fresh = ReponseFournisseur.builder()
                .reponseClient(rc)
                .user(currentFournisseur)
                .dateReponse(new Date())
                .Commentaire(req.getCommentaire())
                .build();

        return repository.save(fresh);
    }

    @Override
    public List<ReponseFournisseur> upsertBatch(List<UpsertFournisseurResponseRequest> reqs, User currentFournisseur) {
        return reqs.stream()
                .map(req -> upsertOne(req, currentFournisseur))
                .toList();
    }
}
