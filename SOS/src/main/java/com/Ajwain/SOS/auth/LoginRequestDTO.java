package com.Ajwain.SOS.auth;

import jakarta.validation.constraints.NotBlank;

public class LoginRequestDTO {
	@NotBlank
	private String identifier;
	@NotBlank
	private String password;
	public String getPassword() {
		return password;
	}
	public void setPassword(String password) {
		this.password=password;
	}
	public String getIdentifier() {
		return identifier;
	}
	public void setIdentifier(String identifier) {
		this.identifier=identifier;
	}
}
