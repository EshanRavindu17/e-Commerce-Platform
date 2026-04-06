package com.example.userService.service;

import com.example.userService.entity.User;
import com.example.userService.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

import java.util.List;

@Service
public class UserService {
    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public User getUserById(Integer id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
    }

    public User getUserByCognitoSub(String cognitoSub) {
        return userRepository.findByCognitoSub(cognitoSub)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
    }

    public User createUser(User user) {
        return userRepository.save(user);
    }

    public User updateUser(Integer id, User updateData) {
        User existingUser = getUserById(id);

        if (updateData.getFirstName() != null) {
            existingUser.setFirstName(updateData.getFirstName());
        }

        if (updateData.getLastName() != null) {
            existingUser.setLastName(updateData.getLastName());
        }

        if (updateData.getEmail() != null) {
            existingUser.setEmail(updateData.getEmail());
        }

        if (updateData.getPhone() != null) {
            existingUser.setPhone(updateData.getPhone());
        }

        if (updateData.getAddress() != null) {
            existingUser.setAddress(updateData.getAddress());
        }

        if (updateData.getUserType() != null) {
            existingUser.setUserType(updateData.getUserType());
        }

        return userRepository.save(existingUser);
    }
}