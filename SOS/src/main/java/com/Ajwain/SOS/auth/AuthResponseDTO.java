package com.Ajwain.SOS.auth;

public class AuthResponseDTO {
	private String token;
	private long userId;
	private String userEmail;
	private String userName;
	public String getToken() {
		return token;
	}
	public void setToken(String token) {
		this.token=token;
	}
	public void setUserId(Long userId) {
		this.userId=userId;
	}
	public Long getUserId() {
		return userId;
	}
	public void setUserEmail(String userEmail) {
		this.userEmail=userEmail;
	}
	public String getUserEmail() {
		return userEmail;
	}
	public void setUserName(String userName) {
		this.userName=userName;
	}
	public String getUserName() {
		return userName;
	}
}
