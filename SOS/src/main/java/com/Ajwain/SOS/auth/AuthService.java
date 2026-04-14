package com.Ajwain.SOS.auth;

import com.Ajwain.SOS.entities.User;
import com.Ajwain.SOS.exception.BadRequestException;
import com.Ajwain.SOS.repositories.UserRepository;

public class AuthService {
	private final UserRepository userRepository;
	public AuthService(UserRepository userRepository) {
		this.userRepository=userRepository;
	}
	public AuthResponseDTO register(RegisterRequestDTO dto) {
			if(userRepository.findByUserEmail(dto.getEmail()) != null||userRepository.findByUserName(dto.getName())!=null)
				throw new BadRequestException("The user already exists");
			User user=new User();
			user.setUserName(dto.getUserName());
			user.setUserEmail(dto.getEmail());
			user.setName(dto.getName());
		
	}
}
