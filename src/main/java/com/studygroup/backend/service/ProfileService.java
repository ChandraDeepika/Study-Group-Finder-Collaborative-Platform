package com.studygroup.backend.service;

import com.studygroup.backend.dto.ProfileCreateRequest;
import com.studygroup.backend.dto.ProfileUpdateRequest;
import com.studygroup.backend.model.User;
import com.studygroup.backend.repository.UserRepository;
import org.springframework.stereotype.Service;

@Service
public class ProfileService {

    private final UserRepository userRepository;

    public ProfileService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }
    //Get Profile
    public User getProfile(String email){
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    //Create Profile(first time)
    public User createProfile(String email, ProfileCreateRequest request){
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        if(user.getUniversityName() != null){
            throw new RuntimeException("Profile already exists");
        }

        user.setUniversityName(request.getUniversityName());
        user.setUniversityPassingYear(request.getUniversityPassingYear());
        user.setUniversityPassingGPA(request.getUniversityPassingGPA());

        return userRepository.save(user);
    }

    //Update Profile
    public User updateProfile(String email, ProfileUpdateRequest request) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setUniversityName(request.getUniversityName());
        user.setUniversityPassingYear(request.getUniversityPassingYear());
        user.setUniversityPassingGPA(request.getUniversityPassingGPA());

        return userRepository.save(user);
    }
}
