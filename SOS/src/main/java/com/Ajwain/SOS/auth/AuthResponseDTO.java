package com.Ajwain.SOS.auth;

public record AuthResponseDTO(
		long userId,

		String userEmail,
		String userName,
		String token) {

}
