package tn.esprit.job.service;

import org.springframework.data.domain.Page;
import tn.esprit.job.model.Question;

import java.util.List;

public interface QuestionService {
    Question createQuestion(Question question);
    List<Question> getAllQuestions();
    Question getQuestionById(Long id);
    Question updateQuestion(Long id, Question updatedQuestion);
    void deleteQuestion(Long id);
    void replaceMembership(Long formulaireId, List<Long> newIds);
    List<Long> getQuestionIdsOfFormulaire(Long formulaireId);
    Page<Question> search(String type, String q, int page, int size);
}
