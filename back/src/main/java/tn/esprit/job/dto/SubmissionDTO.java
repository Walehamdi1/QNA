package tn.esprit.job.dto;

import lombok.*;

import java.util.List;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class SubmissionDTO {

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class Answer {
        private Long questionId;
        private String valeur;
    }

    private List<Answer> answers;
}