package tn.esprit.job.dto;

import lombok.*;
import java.util.List;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class UpdateFormulaireQuestionsRequest {
    private List<Long> questionIds;
}