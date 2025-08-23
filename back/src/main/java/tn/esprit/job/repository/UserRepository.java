package tn.esprit.job.repository;


import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import tn.esprit.job.enumeration.Role;
import tn.esprit.job.model.User;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User,Long> {

    Optional<User> findByEmail(String email);
    User getUserByEmail(String email);
    Optional<User> findByUserId(Long userId);
    List<User> findUserByRole(Role role);
    Optional<User> findByEmailAndResetCode(String email, String resetCode);

}
