package tn.esprit.job.service;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.stereotype.Service;
import tn.esprit.job.dto.ReponseClientDTO;
import tn.esprit.job.dto.SubmissionDTO;
import tn.esprit.job.model.Question;
import tn.esprit.job.model.ReponseClient;
import tn.esprit.job.model.User;
import tn.esprit.job.repository.QuestionRepository;
import tn.esprit.job.repository.ReponseClientRepository;
import tn.esprit.job.repository.UserRepository;
import tn.esprit.job.service.ReponseClientService;

import java.util.Date;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ReponseClientServiceImpl implements ReponseClientService {

    private final ReponseClientRepository repository;
    private final QuestionRepository questionRepository;
    private final UserRepository userRepository;

    @Override
    public ReponseClient create(ReponseClient reponseClient) {
        reponseClient.setDateSoumission(new Date());

        if (reponseClient.getQuestion() != null && reponseClient.getQuestion().getId_Q() != null) {
            Question question = questionRepository.findById(reponseClient.getQuestion().getId_Q())
                    .orElseThrow(() -> new RuntimeException("Question not found with ID: " + reponseClient.getQuestion().getId_Q()));
            reponseClient.setQuestion(question);
        }

        if (reponseClient.getUser() != null && reponseClient.getUser().getUserId() != null) {
            User user = userRepository.findById(reponseClient.getUser().getUserId())
                    .orElseThrow(() -> new RuntimeException("User not found with ID: " + reponseClient.getUser().getUserId()));
            reponseClient.setUser(user);
        }

        return repository.save(reponseClient);
    }

    @Override
    public List<ReponseClient> getAll() {
        return repository.findAll();
    }

    @Override
    public ReponseClient getById(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new RuntimeException("ReponseClient not found with ID: " + id));
    }

    @Override
    public ReponseClient update(Long id, ReponseClient updated) {
        ReponseClient existing = getById(id);
        existing.setValeur(updated.getValeur());
        return repository.save(existing);
    }

    @Override
    public void delete(Long id) {
        if (!repository.existsById(id)) {
            throw new RuntimeException("ReponseClient not found with ID: " + id);
        }
        repository.deleteById(id);
    }

    @Override
    @Transactional
    public List<ReponseClientDTO> submitForFormulaire(
            Long formulaireId,
            SubmissionDTO payload,
            @AuthenticationPrincipal User currentUser
    ) {
        if (currentUser == null || currentUser.getUserId() == null) {
            throw new IllegalStateException("User must be authenticated");
        }
        if (payload == null || payload.getAnswers() == null || payload.getAnswers().isEmpty()) {
            throw new IllegalArgumentException("No answers provided");
        }

        Date now = new Date();

        return payload.getAnswers().stream().map(a -> {
            if (a.getQuestionId() == null ||
                    !questionRepository.existsByIdInFormulaire(a.getQuestionId(), formulaireId)) {
                throw new IllegalArgumentException("Question " + a.getQuestionId() + " not in formulaire " + formulaireId);
            }

            ReponseClient rc = repository
                    .findByUserIdAndQuestionId(currentUser.getUserId(), a.getQuestionId())
                    .orElseGet(() -> {
                        Question q = questionRepository.findById(a.getQuestionId())
                                .orElseThrow(() -> new IllegalArgumentException("Question not found: " + a.getQuestionId()));
                        return ReponseClient.builder()
                                .question(q)
                                .user(currentUser)
                                .build();
                    });

            rc.setValeur(a.getValeur());
            rc.setDateSoumission(now);
            ReponseClient saved = repository.save(rc);

            return ReponseClientDTO.builder()
                    .id(saved.getId_RClient())
                    .questionId(saved.getQuestion().getId_Q())
                    .valeur(saved.getValeur())
                    .dateSoumission(saved.getDateSoumission())
                    .build();
        }).toList();
    }
    @Override
    @Transactional()
    public List<ReponseClientDTO> myResponsesForFormulaire(Long formulaireId, User currentUser) {
        return repository
                .findAllByUserIdAndFormulaireId(currentUser.getUserId(), formulaireId)
                .stream().map(rc -> ReponseClientDTO.builder()
                        .id(rc.getId_RClient())
                        .questionId(rc.getQuestion().getId_Q())
                        .valeur(rc.getValeur())
                        .dateSoumission(rc.getDateSoumission())
                        .build())
                .toList();
    }



}

