package com.example.userService.entity;

import com.fasterxml.jackson.annotation.JsonAlias;
import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "users")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "firstname", nullable = false, length = 50)
    private String firstName;

    @Column(name = "lastname", nullable = false, length = 50)
    private String lastName;
    @Column(nullable = false, unique = true, length = 100)
    private String email;

    @JsonAlias("phoneNumber")
    @Column(length = 20)
    private String phone;

    @Column(columnDefinition = "TEXT")
    private String address;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, name = "usertype")
    private UserType userType;

    @Column(name = "cognito_sub", nullable = false, unique = true)
    private String cognitoSub;
}
