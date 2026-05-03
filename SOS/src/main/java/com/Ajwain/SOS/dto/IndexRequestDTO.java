package com.Ajwain.SOS.dto;

/**
 * DTO for the DocMind /api/index endpoint.
 * Requires both text content and a stable session_id so FAISS can key the index.
 * Convention: session_id = "lecture_" + lecture.getId()
 */
public class IndexRequestDTO {
    private String text;
    private String session_id;

    public IndexRequestDTO(String text, String sessionId) {
        this.text = text;
        this.session_id = sessionId;
    }

    public String getText() { return text; }
    public String getSession_id() { return session_id; }
}
