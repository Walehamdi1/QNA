package tn.esprit.job.service;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import tn.esprit.job.dto.ReponseClientDTO;
import tn.esprit.job.dto.SubmissionDTO;
import tn.esprit.job.model.ReponseClient;
import tn.esprit.job.model.User;

import java.util.List;

public interface ReponseClientService {
    ReponseClient create(ReponseClient reponseClient);
    List<ReponseClient> getAll();
    ReponseClient getById(Long id);
    ReponseClient update(Long id, ReponseClient reponseClient);
    void delete(Long id);
    List<ReponseClientDTO> submitForFormulaire(Long formulaireId,SubmissionDTO payload,@AuthenticationPrincipal User currentUser);
    List<ReponseClientDTO> myResponsesForFormulaire(Long formulaireId, User currentUser);
}
