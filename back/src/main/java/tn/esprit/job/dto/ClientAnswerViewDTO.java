package tn.esprit.job.dto;

import lombok.Builder;
import lombok.Value;

import java.util.Date;

@Value
@Builder
public class ClientAnswerViewDTO {
    Long reponseClientId;

    Long questionId;
    String questionLabel;
    String questionType;

    Long clientUserId;
    String clientEmail;

    String clientAnswer;
    Date submittedAt;

    Long fournisseurResponseId;
    String fournisseurComment;
    Date fournisseurRespondedAt;
}
