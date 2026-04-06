package com.example.userService.dto;

import lombok.Data;

@Data
public class UserDto {
    private String cognitoSub;
    private String email;
    private String firstName;
    private String secondName;
    private String role;
}
