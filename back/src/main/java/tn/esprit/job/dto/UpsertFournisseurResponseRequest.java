package tn.esprit.job.dto;

import lombok.Data;

@Data
public class UpsertFournisseurResponseRequest {
    Long reponseClientId;
    String commentaire;
}
