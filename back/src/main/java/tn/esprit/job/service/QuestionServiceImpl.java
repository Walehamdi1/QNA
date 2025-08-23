package tn.esprit.job.service;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import tn.esprit.job.model.Formulaire;
import tn.esprit.job.model.Question;
import tn.esprit.job.repository.FormulaireRepository;
import tn.esprit.job.repository.QuestionRepository;

import java.util.*;

@Service
@RequiredArgsConstructor
public class QuestionServiceImpl implements QuestionService {

    private final QuestionRepository questionRepository;
    private final FormulaireRepository formulaireRepository;

    @Override
    public Question createQuestion(Question question) {
        if (question.getFormulaire() != null && question.getFormulaire().getId_F() != null) {
            Formulaire formulaire = formulaireRepository.findById(question.getFormulaire().getId_F())
                    .orElseThrow(() -> new RuntimeException("Formulaire not found with ID: " + question.getFormulaire().getId_F()));
            question.setFormulaire(formulaire);
        } else {
            throw new RuntimeException("A Question must be associated with a Formulaire.");
        }
        return questionRepository.save(question);
    }

    @Override
    public List<Question> getAllQuestions() {
        return questionRepository.findAll();
    }

    @Override
    public Question getQuestionById(Long id) {
        return questionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Question not found with ID: " + id));
    }

    @Override
    public Question updateQuestion(Long id, Question updatedQuestion) {
        Question existing = getQuestionById(id);
        existing.setContenu(updatedQuestion.getContenu());
        existing.setType(updatedQuestion.getType());

        if (updatedQuestion.getFormulaire() != null && updatedQuestion.getFormulaire().getId_F() != null) {
            Formulaire formulaire = formulaireRepository.findById(updatedQuestion.getFormulaire().getId_F())
                    .orElseThrow(() -> new RuntimeException("Formulaire not found with ID: " + updatedQuestion.getFormulaire().getId_F()));
            existing.setFormulaire(formulaire);
        }
        return questionRepository.save(existing);
    }

    @Override
    public void deleteQuestion(Long id) {
        if (!questionRepository.existsById(id)) {
            throw new RuntimeException("Question not found with ID: " + id);
        }
        questionRepository.deleteById(id);
    }

    @Override
    public List<Long> getQuestionIdsOfFormulaire(Long formulaireId) {
        formulaireRepository.findById(formulaireId)
                .orElseThrow(() -> new RuntimeException("Formulaire not found with ID: " + formulaireId));
        return questionRepository.findIdsByFormulaireId(formulaireId);
    }

    @Override
    @Transactional
    public void replaceMembership(Long formulaireId, List<Long> newIds) {
        Formulaire formulaire = formulaireRepository.findById(formulaireId)
                .orElseThrow(() -> new RuntimeException("Formulaire not found with ID: " + formulaireId));

        List<Long> targetIds = (newIds == null) ? Collections.emptyList() : newIds.stream().distinct().toList();

        if (targetIds.isEmpty()) {
            questionRepository.detachAll(formulaireId);
            return;
        }

        List<Question> found = questionRepository.findAllByIdIn(targetIds);
        if (found.size() != targetIds.size()) {
            Set<Long> foundIds = new HashSet<>();
            found.forEach(q -> foundIds.add(q.getId_Q()));
            List<Long> missing = new ArrayList<>();
            for (Long id : targetIds) if (!foundIds.contains(id)) missing.add(id);
            throw new RuntimeException("Some question IDs do not exist: " + missing);
        }

        questionRepository.detachMissing(formulaireId, targetIds);
        questionRepository.attachToFormulaire(formulaire, targetIds);
    }

    // ---- Option 2: use only JPQL with ORDER BY id_Q ----
    @Override
    public Page<Question> search(String type, String q, int page, int size) {
        // Important: do NOT pass a Sort here; ORDER BY is in JPQL
        Pageable pageOnly = PageRequest.of(page, size);

        boolean hasType = (type != null && !type.isBlank());
        boolean hasQ    = (q != null && !q.isBlank());

        if (hasType || hasQ) {
            return questionRepository.searchOrderByIdQDesc(
                    hasType ? type : null,
                    hasQ ? q : null,
                    pageOnly
            );
        } else {
            return questionRepository.findAllOrderByIdQDesc(pageOnly);
        }
    }
}
