package com.Ajwain.SOS.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public class IndexRequestDTO {
    private String text;
    @JsonProperty("session_id")
    private String sessionId;
    public IndexRequestDTO(){}
    
    public IndexRequestDTO(String text, String sessionId) {
        this.text = text;
        this.sessionId = sessionId;
    }
    public void setText(String text) {this.text=text;}
    public String getText() { return text; }
    public void setSessionId(String sessionId) {this.sessionId=sessionId;}
    public String getSessionId() { return sessionId; }
}
