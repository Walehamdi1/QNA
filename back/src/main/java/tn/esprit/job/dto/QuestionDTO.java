package tn.esprit.job.dto;

import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class QuestionDTO {
    private Long id;
    private String contenu;
    private String type;
}