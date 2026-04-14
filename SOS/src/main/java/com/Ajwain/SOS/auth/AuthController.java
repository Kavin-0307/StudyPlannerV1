package com.Ajwain.SOS.auth;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
	private final AuthService authService;
	public AuthController(AuthService authService) {
		this.authService=authService;
		
	}
	
	public ResponseEntity<AuthResponseDTO> register(RegisterRequestDTO dto) {
		return ResponseEntity.status(HttpStatus.CREATED).body(authService.register(dto));
	}
}
