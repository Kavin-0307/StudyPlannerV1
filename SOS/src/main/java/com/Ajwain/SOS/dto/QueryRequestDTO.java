package com.Ajwain.SOS.dto;
import com.fasterxml.jackson.annotation.JsonProperty;
public class QueryRequestDTO {
	private String question;
	@JsonProperty("session_id")
	private String sessionId;
	private int k=3;
	public void setQuestion(String question) {
		this.question=question;
	}
	public void setSessionId(String sessionId) {
		this.sessionId=sessionId;
		
	}
	public String getQuestion() {return question;}
	public String getSessionId() {return sessionId;}
	
	public int getK() { return k; }
    public void setK(int k) { this.k = k; }
}
