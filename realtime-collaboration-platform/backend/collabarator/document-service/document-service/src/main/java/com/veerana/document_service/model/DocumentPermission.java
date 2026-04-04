package com.veerana.document_service.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "document_permissions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DocumentPermission {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    private String documentId;

    private String userEmail;

    @Enumerated(EnumType.STRING)
    private Role role;
}