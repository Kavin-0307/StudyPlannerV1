package com.Ajwain.SOS.auth;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.Ajwain.SOS.entities.User;
import com.Ajwain.SOS.exception.BadRequestException;
import com.Ajwain.SOS.exception.ResourceNotFoundException;
import com.Ajwain.SOS.repositories.UserRepository;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;
    private final JwtService jwtService;
    private final UserRepository userRepository;
    public AuthController(AuthService authService,JwtService jwtService,UserRepository userRepository) {
        this.authService = authService;
        this.userRepository=userRepository;
        this.jwtService=jwtService;
    }
    @PostMapping("/register")
    public ResponseEntity<AuthResponseDTO> register(@Valid @RequestBody RegisterRequestDTO dto) {

        AuthResponseDTO response = authService.register(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
    @PostMapping("/refresh")
    public ResponseEntity<AuthResponseDTO> refresh(
            @RequestHeader(value = "Authorization", required = false) String authHeader) {

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            throw new BadRequestException("Missing or invalid Authorization header");
        }

        String token = authHeader.substring(7);

        try {
            String email = jwtService.extractUsername(token);
            User user = userRepository.findByUserEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

            String newToken = jwtService.generateToken(user.getUserEmail());
            return ResponseEntity.ok(authService.convertToResponseDTO(user, newToken));

        } catch (Exception e) {
            throw new BadRequestException("Invalid token");
        }
    }
    @PostMapping("/login")
    public ResponseEntity<AuthResponseDTO> login(@Valid@RequestBody LoginRequestDTO dto) {

        AuthResponseDTO response = authService.login(dto);
        return ResponseEntity.ok(response);
    }
}