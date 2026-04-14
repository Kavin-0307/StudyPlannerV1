package com.Ajwain.SOS.auth;

import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import java.util.UUID;
import com.Ajwain.SOS.entities.User;
import com.Ajwain.SOS.exception.BadRequestException;
import com.Ajwain.SOS.exception.ResourceNotFoundException;
import com.Ajwain.SOS.repositories.UserRepository;
@Service
public class AuthService {
	private final UserRepository userRepository;
	private final PasswordEncoder passwordEncoder;
	public AuthService(UserRepository userRepository,PasswordEncoder passwordEncoder) {
		this.userRepository=userRepository;
		this.passwordEncoder=passwordEncoder;
	}
	public AuthResponseDTO register(RegisterRequestDTO dto) {
			if(userRepository.findByUserEmail(dto.getUserEmail()) .isPresent()||userRepository.findByUserName(dto.getUserName()).isPresent())
				throw new BadRequestException("The user already exists");
			User user=new User();
			user.setUserName(dto.getUserName());
			user.setUserEmail(dto.getUserEmail());
			user.setPassword(passwordEncoder.encode(dto.getPassword()));
			user.setUserStatus(true);
			user.setUserId(UUID.randomUUID().toString());
			User saved=userRepository.save(user);
			//add a jwt here
			String token="";
			return convertToResponseDTO(saved,token);
			
		
	}
	public AuthResponseDTO login(LoginRequestDTO dto) {
		String identifier=dto.getIdentifier();
		User user;
		if(identifier.contains("@")) {
			user=userRepository.findByUserEmail(dto.getIdentifier()).orElseThrow(()->new ResourceNotFoundException("Invalid Credentials"));
		}
		else {
			user=userRepository.findByUserName(identifier).orElseThrow(()->new ResourceNotFoundException("Invalid Credentials"));
		}
		if (!passwordEncoder.matches(dto.getPassword(), user.getPassword()))
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"Invalid Credentials");
		//generate jwt somehow
		String token="";
		return convertToResponseDTO(user,token);
			
	}
	public AuthResponseDTO convertToResponseDTO(User user,String token) {
		return new AuthResponseDTO(user.getId(),user.getUserEmail(),user.getUserName(),token);
	}
}
