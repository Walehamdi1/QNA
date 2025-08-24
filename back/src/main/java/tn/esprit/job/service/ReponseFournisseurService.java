package tn.esprit.job.service;

import tn.esprit.job.dto.ClientAnswerViewDTO;
import tn.esprit.job.dto.UpsertFournisseurResponseRequest;
import tn.esprit.job.model.ReponseFournisseur;
import tn.esprit.job.model.User;

import java.util.List;

public interface ReponseFournisseurService {
    ReponseFournisseur create(ReponseFournisseur reponse);
    List<ReponseFournisseur> getAll();
    ReponseFournisseur getById(Long id);
    ReponseFournisseur update(Long id, ReponseFournisseur updated);
    void delete(Long id);
    List<ClientAnswerViewDTO> listAnswersForFormulaire(Long formulaireId,Long clientUserIdOrNull,User currentFournisseur);
    ReponseFournisseur upsertOne(UpsertFournisseurResponseRequest req, User currentFournisseur);
    List<ReponseFournisseur> upsertBatch(List<UpsertFournisseurResponseRequest> reqs, User currentFournisseur);
}
