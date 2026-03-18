package com.Ajwain.SOS.dto;

import java.time.LocalDate;

import com.Ajwain.SOS.entities.enums.Goal;

public record UserResponseDTO(Long id,
		String userName,
		String userId,
		boolean userStatus,
		LocalDate dateOfBirth,
		Goal goal,
		String userEmail
		) {

}
