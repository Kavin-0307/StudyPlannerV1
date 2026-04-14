package com.Ajwain.SOS.auth;

import java.util.Collections;

import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import com.Ajwain.SOS.entities.User;
import com.Ajwain.SOS.exception.ResourceNotFoundException;
import com.Ajwain.SOS.repositories.UserRepository;
@Service
public class CustomUserDetailsService implements UserDetailsService{
	private final UserRepository userRepository;
	public CustomUserDetailsService(UserRepository userRepository) {
		this.userRepository=userRepository;
	}
	@Override
	public  UserDetails loadUserByUsername(String identifier) throws UsernameNotFoundException{
		User userEntity;
		  if (identifier.contains("@")) {
	            userEntity = userRepository.findByUserEmail(identifier)
	                    .orElseThrow(() -> new UsernameNotFoundException("Invalid credentials"));
	        } else {
	            userEntity = userRepository.findByUserName(identifier)
	                    .orElseThrow(() -> new UsernameNotFoundException("Invalid credentials"));
	        }
		return new org.springframework.security.core.userdetails.User(userEntity.getUserEmail(), userEntity.getPassword(), userEntity.isUserStatus(),true,true,true,Collections.emptyList());
		
			
	}
}
