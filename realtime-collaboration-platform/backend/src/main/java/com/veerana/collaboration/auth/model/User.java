package com.veerana.collaboration.auth.model;

import jakarta.persistence.*;
import lombok.*;

import com.veerana.collaboration.auth.model.AuthProvider;

import java.time.LocalDateTime;

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String email;

    @Column(nullable = true)
    private String password;

    private String fullName;

    private String phoneNumber;

    @Enumerated(EnumType.STRING)
    private Role role;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @Builder.Default
    @Column(nullable = false)
    private Boolean enabled = true;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AuthProvider provider;

}
