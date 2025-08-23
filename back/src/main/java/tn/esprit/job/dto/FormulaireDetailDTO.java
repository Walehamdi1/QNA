package tn.esprit.job.dto;

import lombok.*;

import java.util.Date;
import java.util.List;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class FormulaireDetailDTO {
    private Long id;
    private String titre;
    private Date dateCreation;
    private List<QuestionDTO> questions;
}