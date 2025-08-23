package tn.esprit.job.dto;


import lombok.*;

import java.util.Date;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class FormulaireListDTO {
    private Long id;
    private String titre;
    private Date dateCreation;
    private String ownerEmail;
}