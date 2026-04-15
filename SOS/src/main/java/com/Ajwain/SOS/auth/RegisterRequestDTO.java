package com.Ajwain.SOS.auth;

import com.fasterxml.jackson.annotation.JsonProperty;

public class RegisterRequestDTO {

    @JsonProperty("username")
    private String userName;

    @JsonProperty("email")
    private String userEmail;

    private String password;
    public String getUserEmail() {
		return userEmail;
	}
	public void setUserEmail(String userEmail) {
		this.userEmail=userEmail;
	}
	public String getUserName() {
		return userName;
	}
	public void setUserName(String userName) {
		this.userName=userName;
	}
	public String getPassword() {
		return password;
	}
	public void setPassword(String password) {
		this.password=password;
	}
    // getters & setters
}
