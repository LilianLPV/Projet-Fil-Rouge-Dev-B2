package com.ymmo.service;

import com.ymmo.model.Agency;
import com.ymmo.model.Role;
import com.ymmo.model.User;
import com.ymmo.repository.UserRepository;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class UserService {

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public List<User> findAll() {
        return userRepository.findAll();
    }

    public User findById(Integer id) {
        return userRepository.findById(id).orElse(null);
    }

    public Optional<User> findByUsername(String username) {
        return userRepository.findByUsername(username);
    }

    public List<User> findByAgency(Agency agency) {
        return userRepository.findByAgency(agency);
    }

    public List<User> findByRole(Role role) {
        return userRepository.findByRole(role);
    }

    public User save(User user) {
        // Si aucun rôle n'est fourni, assigner le rôle CLIENT (id=3) par défaut
        if (user.getRole() == null) {
            Role clientRole = new Role();
            clientRole.setId(3);
            user.setRole(clientRole);
        }

        // Si password est null lors d'une mise à jour, conserver l'ancien mot de passe
        if (user.getPassword() == null && user.getId() != null) {
            User existing = userRepository.findById(user.getId()).orElse(null);
            if (existing != null) {
                user.setPassword(existing.getPassword());
            }
        }

        return userRepository.save(user);
    }

    public void delete(Integer id) {
        userRepository.deleteById(id);
    }
}
