package com.veerana.collaboration.auth.security;

import java.util.Collections;

import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import com.veerana.collaboration.auth.model.User;
import com.veerana.collaboration.auth.repository.UserRepository;

@Service
public class CustomUserDetailsService implements UserDetailsService {

        private final UserRepository userRepository;

        public CustomUserDetailsService(UserRepository userRepository) {
                this.userRepository = userRepository;
        }

        @Override
        public UserDetails loadUserByUsername(String email)
                        throws UsernameNotFoundException {

                User user = userRepository.findByEmail(email)
                                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + email));

                return org.springframework.security.core.userdetails.User
                                .withUsername(user.getEmail())
                                .password(
                                                user.getPassword() != null ? user.getPassword() : "")
                                .authorities(
                                                Collections.singleton(
                                                                new SimpleGrantedAuthority(
                                                                                "ROLE_" + user.getRole().name())))
                                .accountExpired(false)
                                .accountLocked(false)
                                .credentialsExpired(false)
                                .disabled(Boolean.FALSE.equals(user.getEnabled()))
                                .build();

        }
}
