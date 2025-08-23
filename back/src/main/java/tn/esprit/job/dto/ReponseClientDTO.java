package tn.esprit.job.dto;

import lombok.*;

import java.util.Date;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ReponseClientDTO {
    private Long id;
    private Long questionId;
    private String valeur;
    private Date dateSoumission;
}